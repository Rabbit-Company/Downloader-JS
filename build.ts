import dts from "bun-plugin-dts";
import Logger from "@rabbit-company/logger";
import fs from "fs/promises";

await fs.rm("./module", { recursive: true, force: true });

Logger.info("Start bulding module...");
let moduleBuild = await Bun.build({
	entrypoints: ["./src/downloader.ts"],
	outdir: "./module",
	target: "node",
	format: "esm",
	plugins: [dts({ output: { noBanner: true } })],
});

if (moduleBuild.success) {
	Logger.info("Bulding module complete");
} else {
	Logger.error("Bulding module failed");
}
