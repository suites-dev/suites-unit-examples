import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "suites-source.json")));
const source = resolve(process.argv[2] || join(root, ".suites-source"));
const run = (command, args, cwd = source) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });
const output = (command, args, cwd = source) =>
  execFileSync(command, args, { cwd, encoding: "utf8" }).trim();
assert.equal(
  Number(process.versions.node.split(".")[0]),
  26,
  "Build the pinned source with Node 26; run example tests on Node 22, 24, or 26.",
);
assert.equal(
  output("pnpm", ["--version"], root),
  "12.16.1",
  "Use pnpm 12.16.1",
);
if (!process.argv[2]) {
  // The default path is ignored by Git and contains only this helper's source checkout.
  mkdirSync(source, { recursive: true });
  run("git", ["init"]);
  run("git", ["fetch", config.repository, config.commit, "--depth=1"]);
  run("git", ["checkout", "--detach", "FETCH_HEAD"]);
}
assert.equal(
  output("git", ["rev-parse", "HEAD"]),
  config.commit,
  "Source checkout must match suites-source.json",
);
assert.equal(
  output("git", ["status", "--porcelain", "--untracked-files=no"]),
  "",
  "Use a clean source checkout",
);
run("pnpm", ["install", "--frozen-lockfile"]);
run("pnpm", ["build"]);
const destination = join(root, ".suites-packages");
mkdirSync(destination, { recursive: true });
for (const pkg of config.packages) {
  const cwd = join(source, pkg.path);
  const manifest = JSON.parse(readFileSync(join(cwd, "package.json")));
  assert.equal(manifest.name, pkg.name);
  assert.equal(manifest.version, pkg.version);
  // pnpm pack resolves workspace dependency ranges and includes the published files.
  const result = JSON.parse(
    output("pnpm", ["pack", "--json", "--pack-destination", destination], cwd),
  );
  const filename = Array.isArray(result)
    ? result[0].filename
    : result.filename || result.tarballPath;
  assert(filename, "pnpm pack did not report a tarball");
  renameSync(resolve(destination, filename), join(destination, pkg.tarball));
}
assert.equal(
  output("git", ["status", "--porcelain", "--untracked-files=no"]),
  "",
  "Packing changed the source checkout",
);
writeFileSync(
  join(destination, "source.json"),
  JSON.stringify(config, null, 2) + "\n",
);
console.log(
  `Packed ${config.packages.length} Suites packages from ${config.commit}. Install and test any example with pnpm.`,
);
