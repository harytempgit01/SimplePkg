import { chmod, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = resolve(root, "src");
const distDir = resolve(root, "dist");

await rm(distDir, { force: true, recursive: true });
await mkdir(distDir, { recursive: true });
await cp(srcDir, distDir, { recursive: true });
await chmod(resolve(distDir, "cli.js"), 0o755);

const { Command } = await import("commander");
const smokeCommand = new Command()
  .exitOverride()
  .allowUnknownOption(false)
  .option("--format <type>", "output format", "text");
smokeCommand.parse(["node", "build-smoke", "--format", "json"]);

if (smokeCommand.opts().format !== "json") {
  throw new Error(`Dependency smoke check failed: ${JSON.stringify(smokeCommand.opts())}`);
}

console.log("Built dist/ from src/");
