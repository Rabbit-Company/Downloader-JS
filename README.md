# Downloader

A powerful library to handle large file downloads with support for multiple runtimes (`Node.js`, `Deno`, `Bun`). The `Downloader` class provides chunked downloads, retry mechanisms, and progress tracking with speed monitoring.

---

## Features

- **Cross-Platform**: Works seamlessly in `Node.js`, `Deno`, and `Bun`.
- **Progress Tracking**: Reports real-time download progress as a percentage.
- **Speed Monitoring**: Calculates download speed in bytes per second.
- **Chunked Downloads**: Downloads files in configurable chunk sizes to handle large files efficiently.
- **Retry Mechanism**: Automatically retries failed chunks with customizable timeout and retry limits.
- **Custom Callbacks**: Receive progress and speed updates via a callback.
- **Flexible Configuration**: Allows fine-tuning of options such as HTTP method, headers, and body data.

---

## Installation

```bash
npm i --save @rabbit-company/downloader
```

## Usage

```js
import { Downloader } from "@rabbit-company/downloader";

const downloader = new Downloader({
	url: "https://example.com/large-file.zip", // URL of the file
	destinationPath: "./downloads/large-file.zip", // Local destination path
	chunkSize: 10 * 1024 * 1024, // Optional: Chunk size (defaults to 10 MB)
	method: HttpMethod.GET, // Optional: HTTP method (defaults to GET)
	retryTimeout: 5000, // Optional: Time to wait before retrying a failed request (default: 5000 ms)
	maxRetries: 120, // Optional: Maximum retries for failed chunks (default: 120)
	headers: {
		Authorization: "Bearer YOUR_AUTH_TOKEN", // Optional: Custom headers (e.g., for authentication)
	},
	body: JSON.stringify({ sending: "json" }), // Optional: The body of the request (useful for POST, PUT, etc.).
});

// Starts the download process. Resolves to true if the download completes successfully, otherwise throws an error.
downloader
	.download((progress, speed) => {
		console.log(`Download progress: ${progress.toFixed(2)}% - ${(speed / 1024).toFixed(2)} KB/s`);
	})
	.then(() => {
		console.log("Download completed successfully!");
	})
	.catch((err) => {
		console.error("Download failed:", err.message);
	});

// Returns the current download progress as a percentage (0-100).
downloader.getProgress();

//Returns the current download speed in bytes per second.
downloader.getDownloadSpeed();
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Rabbit-Company/Downloader-JS/blob/main/LICENSE) file for details.
