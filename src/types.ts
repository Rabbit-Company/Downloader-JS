/**
 * HTTP Methods enum.
 */
export enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
	HEAD = "HEAD",
	OPTIONS = "OPTIONS",
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
