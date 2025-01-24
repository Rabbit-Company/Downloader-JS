import { describe, expect, test } from "bun:test";
import { Downloader, HttpMethod } from "../src/downloader";

describe("downloader", () => {
	test("url", async () => {
		const downloader = new Downloader({
			url: "https://fsn1-speed.hetzner.com/100MB.bin",
			destinationPath: "./tmp/test.bin",
		});

		await downloader.download((progress, speed) => {
			console.log(`Download progress: ${progress.toFixed(2)}% - ${(speed / 1024).toFixed(2)} KB/s - ${((speed / 1024 / 1024) * 8).toFixed(2)} Mbps`);
		});

		expect(downloader.getProgress()).toBe(100);
	});
});
