/**
 * HTTP Methods enum.
 */
export declare enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
	HEAD = "HEAD",
	OPTIONS = "OPTIONS"
}
/**
 * Configuration options for the Downloader class.
 */
export interface DownloaderConfig {
	/**
	 * The URL of the file to download.
	 */
	url: string;
	/**
	 * The local file path where the downloaded file will be saved.
	 */
	destinationPath: string;
	/**
	 * HTTP method to use for the download request. Defaults to "GET".
	 */
	method?: HttpMethod;
	/**
	 * Custom headers for the download request, including optional authorization and other headers.
	 * This can be used to pass authentication tokens, custom user agents, or other HTTP headers.
	 */
	headers?: Record<string, string>;
	/**
	 * The body of the request, which can be used for methods like POST, PUT, etc.
	 * This allows sending data in the request body, such as JSON payloads, form data, or other types of content.
	 */
	body?: any;
	/**
	 * Size of each download chunk in bytes. Defaults to 10 MB.
	 */
	chunkSize?: number;
	/**
	 * Time in milliseconds to wait before retrying a failed request. Defaults to 5000 ms.
	 */
	retryTimeout?: number;
	/**
	 * Maximum number of retries for failed requests. Defaults to 120 retries.
	 */
	maxRetries?: number;
}
/**
 * A class to handle large file downloads with support for various runtimes
 * (Node.js, Deno, Bun) and progress tracking.
 */
export declare class Downloader {
	private url;
	private destinationPath;
	private method;
	private headers;
	private body;
	private chunkSize;
	private retryTimeout;
	private maxRetries;
	private totalSize;
	private downloadedSize;
	private lastTime;
	private lastDownloadedSize;
	private progressCallback?;
	/**
	 * Creates a new instance of the Downloader class.
	 * @param {DownloaderConfig} config - Configuration options for the downloader.
	 */
	constructor(config: DownloaderConfig);
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
