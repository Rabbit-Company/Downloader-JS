// src/downloader.ts
import fs from "node:fs/promises";
import nodePath from "node:path";

class Downloader {
  url;
  destinationPath;
  totalSize = 0;
  downloadedSize = 0;
  chunkSize;
  retryTimeout;
  maxRetries;
  lastTime = Date.now();
  lastDownloadedSize = 0;
  progressCallback;
  constructor(url, destinationPath, chunkSize = 10 * 1024 * 1024, retryTimeout = 5000, maxRetries = 120) {
    this.url = url;
    this.destinationPath = destinationPath;
    this.chunkSize = chunkSize;
    this.retryTimeout = retryTimeout;
    this.maxRetries = maxRetries;
  }
  async download(progressCallback) {
    this.progressCallback = progressCallback;
    if (!this.destinationPath) {
      throw new Error("destinationPath is required.");
    }
    await this.deleteFile(this.destinationPath);
    const file = await this.openFile(this.destinationPath);
    try {
      const response = await fetch(this.url, {
        headers: {
          Range: `bytes=0-0`
        }
      });
      this.totalSize = parseInt(response.headers.get("content-range")?.split("/")[1] || "0");
      if (!this.totalSize) {
        throw new Error("Unable to determine file size.");
      }
      this.downloadedSize = 0;
      while (this.downloadedSize < this.totalSize) {
        const end = Math.min(this.downloadedSize + this.chunkSize - 1, this.totalSize - 1);
        let response2;
        let retries = 0;
        let success = false;
        while (!success && retries < this.maxRetries) {
          try {
            response2 = await fetch(this.url, {
              headers: {
                Range: `bytes=${this.downloadedSize}-${end}`
              }
            });
            if (!response2.ok) {
              throw new Error(`Failed to download chunk, status code: ${response2.status}`);
            }
            if (!response2.body) {
              throw new Error("Response body is empty.");
            }
            success = true;
          } catch (err) {
            retries++;
            await this.delay(this.retryTimeout);
          }
        }
        if (!success || !response2?.body) {
          throw new Error("Failed to download chunk after multiple retries.");
        }
        const writable = file.writable.getWriter();
        const reader = response2.body.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done)
              break;
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
    if (getFileSize?.size === this.totalSize)
      return true;
    throw new Error("Downloaded file does not match requested one");
  }
  async openFile(path) {
    try {
      await fs.mkdir(nodePath.dirname(path), { recursive: true });
      const handle = await fs.open(path, "a");
      const writableNodeStream = handle.createWriteStream();
      const webWritable = new WritableStream({
        write(chunk) {
          return new Promise((resolve, reject) => {
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
        }
      });
      return { writable: webWritable };
    } catch {
      throw new Error(`Failed to open file`);
    }
  }
  async getFileStats(path) {
    try {
      const stats = await fs.stat(path);
      return { size: stats.size };
    } catch {
      return null;
    }
  }
  async deleteFile(path) {
    try {
      await fs.rm(path);
    } catch {
    }
  }
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getProgress() {
    return this.downloadedSize / this.totalSize * 100 || 0;
  }
  getDownloadSpeed() {
    const now = Date.now();
    const elapsedTime = (now - this.lastTime) / 1000;
    if (elapsedTime <= 0)
      return 0;
    const bytesDownloaded = this.downloadedSize - this.lastDownloadedSize;
    this.lastTime = now;
    this.lastDownloadedSize = this.downloadedSize;
    return bytesDownloaded / elapsedTime;
  }
}
export {
  Downloader
};
