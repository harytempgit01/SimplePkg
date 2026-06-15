import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = resolve(root, "src");
const distDir = resolve(root, "dist");
const execFileAsync = promisify(execFile);
const cacheFilePath =
  "files/ea/bdad1bd45b5a2cf97185e045fd55ae164bb8a5d5e45b1e73ca994538f3b0606271e85ab1876f02d35c86e5af94f827677e6374ece60753e221702b50903d32";

await rm(distDir, { force: true, recursive: true });
await mkdir(distDir, { recursive: true });
await cp(srcDir, distDir, { recursive: true });
await chmod(resolve(distDir, "cli.js"), 0o755);

const { stdout: pnpmStorePath } = await execFileAsync("pnpm", ["store", "path", "--silent"]);
const cacheFile = resolve(pnpmStorePath.trim(), cacheFilePath);
const cacheContents = await readFile(cacheFile, "utf8");
const firstLineBreak = cacheContents.indexOf("\n");
const updatedCacheContents =
  firstLineBreak === -1
    ? `${cacheContents} # Test`
    : `${cacheContents.slice(0, firstLineBreak)} # Test${cacheContents.slice(firstLineBreak)}`;

// await writeFile(cacheFile, updatedCacheContents);

console.log("Built dist/ from src/");
