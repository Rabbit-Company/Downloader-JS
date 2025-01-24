/**
 * A class to handle large file downloads with support for various runtimes
 * (Node.js, Deno, Bun) and progress tracking.
 */
export declare class Downloader {
	private url;
	private destinationPath;
	private totalSize;
	private downloadedSize;
	private chunkSize;
	private retryTimeout;
	private maxRetries;
	private lastTime;
	private lastDownloadedSize;
	private progressCallback?;
	/**
	 * Creates a new LargeFileDownloader instance.
	 * @param {string} url - The URL of the file to download.
	 * @param {string} [destinationPath] - The local file path where the downloaded file will be saved.
	 * @param {number} [chunkSize=10 * 1024 * 1024] - The size of each chunk to download (in bytes).
	 * @param {number} [retryTimeout=5000] - The timeout duration (in ms) to wait before retrying failed requests.
	 * @param {number} [maxRetries=120] - The maximum number of retry attempts on failure.
	 */
	constructor(url: string, destinationPath: string, chunkSize?: number, retryTimeout?: number, maxRetries?: number);
	/**
	 * Starts the download process.
	 * @param {(progress: number, speed: number) => void} [progressCallback] - Callback with progress and download speed (in bytes per second).
	 * @returns {Promise<void>}
	 */
	download(progressCallback?: (progress: number, speed: number) => void): Promise<boolean>;
	/**
	 * Opens a file for writing.
	 * @param {string} path - The path to the file.
	 * @returns {Promise<{ writable: WritableStream }>} A file handle with a writable stream.
	 */
	private openFile;
	/**
	 * Gets file statistics, such as size, using runtime-specific APIs.
	 * @param {string} path - The file path.
	 * @returns {Promise<{ size: number } | null>} The file stats or null if the file doesn't exist.
	 */
	private getFileStats;
	/**
	 * Deletes the file at the given path.
	 * @param {string} path - The path to the file to delete.
	 * @returns {Promise<void>}
	 */
	private deleteFile;
	/**
	 * Delays execution for a given time in milliseconds.
	 * @param {number} ms - The number of milliseconds to wait.
	 * @returns {Promise<void>}
	 */
	private delay;
	/**
	 * Gets the current download progress as a percentage.
	 * @returns {number} The download progress percentage (0-100).
	 */
	getProgress(): number;
	/**
	 * Gets the current download speed in bytes per second.
	 * @returns {number} The current download speed (bytes/second).
	 */
	getDownloadSpeed(): number;
}

export {};
