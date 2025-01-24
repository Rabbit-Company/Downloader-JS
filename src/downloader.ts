import fs from "node:fs/promises";
import nodePath from "node:path";

/**
 * A class to handle large file downloads with support for various runtimes
 * (Node.js, Deno, Bun) and progress tracking.
 */
class Downloader {
	private totalSize: number = 0;
	private downloadedSize: number = 0;
	private chunkSize: number;
	private retryTimeout: number;
	private maxRetries: number;
	private lastTime: number = Date.now();
	private lastDownloadedSize: number = 0;
	private progressCallback?: (progress: number, speed: number) => void;

	/**
	 * Creates a new LargeFileDownloader instance.
	 * @param {string} url - The URL of the file to download.
	 * @param {string} [destinationPath] - The local file path where the downloaded file will be saved.
	 * @param {number} [chunkSize=10 * 1024 * 1024] - The size of each chunk to download (in bytes).
	 * @param {number} [retryTimeout=5000] - The timeout duration (in ms) to wait before retrying failed requests.
	 * @param {number} [maxRetries=120] - The maximum number of retry attempts on failure.
	 */
	constructor(private url: string, private destinationPath: string, chunkSize: number = 10 * 1024 * 1024, retryTimeout = 5000, maxRetries = 120) {
		this.chunkSize = chunkSize;
		this.retryTimeout = retryTimeout;
		this.maxRetries = maxRetries;
	}

	/**
	 * Starts the download process.
	 * @param {(progress: number, speed: number) => void} [progressCallback] - Callback with progress and download speed (in bytes per second).
	 * @returns {Promise<void>}
	 */
	async download(progressCallback?: (progress: number, speed: number) => void): Promise<boolean> {
		this.progressCallback = progressCallback;

		if (!this.destinationPath) {
			throw new Error("destinationPath is required.");
		}

		await this.deleteFile(this.destinationPath);

		const file = await this.openFile(this.destinationPath);

		try {
			const response = await fetch(this.url, {
				headers: {
					Range: `bytes=0-0`,
				},
			});

			this.totalSize = parseInt(response.headers.get("content-range")?.split("/")[1] || "0");
			if (!this.totalSize) {
				throw new Error("Unable to determine file size.");
			}

			this.downloadedSize = 0;

			while (this.downloadedSize < this.totalSize) {
				const end = Math.min(this.downloadedSize + this.chunkSize - 1, this.totalSize - 1);

				let response;
				let retries = 0;
				let success = false;

				while (!success && retries < this.maxRetries) {
					try {
						response = await fetch(this.url, {
							headers: {
								Range: `bytes=${this.downloadedSize}-${end}`,
							},
						});

						if (!response.ok) {
							throw new Error(`Failed to download chunk, status code: ${response.status}`);
						}

						if (!response.body) {
							throw new Error("Response body is empty.");
						}

						success = true;
					} catch (err) {
						retries++;
						await this.delay(this.retryTimeout);
					}
				}

				if (!success || !response?.body) {
					throw new Error("Failed to download chunk after multiple retries.");
				}

				const writable = file.writable.getWriter();
				const reader = response.body.getReader();

				try {
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;

						let writeRetries = 0;
						let writeSuccess = false;

						while (!writeSuccess && writeRetries < this.maxRetries) {
							try {
								await writable.write(value);
								writeSuccess = true;
							} catch (err) {
								writeRetries++;
								await this.delay(this.retryTimeout);
							}
						}

						if (!writeSuccess) {
							throw new Error("Failed to write chunk after multiple retries.");
						}

						this.downloadedSize += value.length;

						const now = Date.now();
						if (now - this.lastTime > 1000) {
							const speed = this.getDownloadSpeed();
							if (this.progressCallback) {
								this.progressCallback(this.getProgress(), speed);
							}
						}
					}
				} catch (err) {
					console.error("Error processing chunk:", err);
					throw err;
				} finally {
					writable.releaseLock();
					reader.releaseLock?.();
				}
			}
		} catch {
			throw new Error("Request to server failed");
		}

		const getFileSize = await this.getFileStats(this.destinationPath);
		if (getFileSize?.size === this.totalSize) return true;

		throw new Error("Downloaded file does not match requested one");
	}

	/**
	 * Opens a file for writing.
	 * @param {string} path - The path to the file.
	 * @returns {Promise<{ writable: WritableStream }>} A file handle with a writable stream.
	 */
	private async openFile(path: string): Promise<{ writable: WritableStream }> {
		try {
			await fs.mkdir(nodePath.dirname(path), { recursive: true });

			const handle = await fs.open(path, "a");
			const writableNodeStream = handle.createWriteStream();

			const webWritable = new WritableStream({
				write(chunk) {
					return new Promise<void>((resolve, reject) => {
						writableNodeStream.write(chunk, (err) => {
							if (err) {
								reject(new Error(`Write error: ${err.message}`));
							} else {
								resolve();
							}
						});
					});
				},
				close() {
					writableNodeStream.end();
				},
				abort(err) {
					writableNodeStream.destroy(err);
				},
			});

			return { writable: webWritable };
		} catch {
			throw new Error(`Failed to open file`);
		}
	}

	/**
	 * Gets file statistics, such as size, using runtime-specific APIs.
	 * @param {string} path - The file path.
	 * @returns {Promise<{ size: number } | null>} The file stats or null if the file doesn't exist.
	 */
	private async getFileStats(path: string): Promise<{ size: number } | null> {
		try {
			const stats = await fs.stat(path);
			return { size: stats.size };
		} catch {
			return null;
		}
	}

	/**
	 * Deletes the file at the given path.
	 * @param {string} path - The path to the file to delete.
	 * @returns {Promise<void>}
	 */
	private async deleteFile(path: string): Promise<void> {
		try {
			await fs.rm(path);
		} catch {}
	}

	/**
	 * Delays execution for a given time in milliseconds.
	 * @param {number} ms - The number of milliseconds to wait.
	 * @returns {Promise<void>}
	 */
	private async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Gets the current download progress as a percentage.
	 * @returns {number} The download progress percentage (0-100).
	 */
	getProgress(): number {
		return (this.downloadedSize / this.totalSize) * 100 || 0;
	}

	/**
	 * Gets the current download speed in bytes per second.
	 * @returns {number} The current download speed (bytes/second).
	 */
	getDownloadSpeed(): number {
		const now = Date.now();
		const elapsedTime = (now - this.lastTime) / 1000;

		if (elapsedTime <= 0) return 0;

		const bytesDownloaded = this.downloadedSize - this.lastDownloadedSize;

		this.lastTime = now;
		this.lastDownloadedSize = this.downloadedSize;

		return bytesDownloaded / elapsedTime;
	}
}

export { Downloader };
