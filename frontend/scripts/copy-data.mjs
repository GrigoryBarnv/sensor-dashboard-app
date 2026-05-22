import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..");
const sourceDir = resolve(projectRoot, "data");
const targetDir = resolve(process.cwd(), "public", "data");

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

const files = readdirSync(targetDir)
  .filter((name) => /\.csv$/i.test(name))
  .sort((a, b) => a.localeCompare(b));

writeFileSync(resolve(targetDir, "index.json"), JSON.stringify({ files }, null, 2), "utf8");
console.log(`Copied ${files.length} CSV files to ${targetDir}`);
