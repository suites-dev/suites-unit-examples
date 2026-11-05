import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "suites-versions.json")));
const example = process.argv[2];
assert(
  config.examples.includes(example),
  "Select an example listed in suites-versions.json",
);
const expected = new Map(Object.entries(config.packages));
const manifestPath = join(root, example, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath));
const found = new Map();
const visited = new Set();

// Follow actual dependency resolution; pnpm may retain unused old package caches.
function visit(name, from) {
  // Resolve the installed manifest directly, including type-only packages
  // whose exports intentionally have no runtime entry point.
  const candidate = createRequire(from).resolve.paths(name)
    .map((base) => join(base, name, "package.json"))
    .find(existsSync);
  assert(candidate, `Cannot find installed package: ${name}`);
  const installedPath = realpathSync(candidate);
  const location = dirname(installedPath);
  const installed = JSON.parse(readFileSync(installedPath));
  assert.equal(installed.name, name);
  if (visited.has(location)) return;
  visited.add(location);
  assert(expected.has(name), `Unexpected Suites package: ${name}`);
  assert.equal(installed.version, expected.get(name), `Wrong version of ${name}`);
  assert(!installed.scripts?.postinstall, `${name} still has a postinstall hook`);
  found.set(name, installed.version);
  for (const dependency of Object.keys(installed.dependencies || {})) {
    if (dependency.startsWith("@suites/")) visit(dependency, join(location, "package.json"));
  }
}
for (const name of Object.keys(manifest.devDependencies)) {
  if (name.startsWith("@suites/")) visit(name, manifestPath);
}
for (const name of Object.keys(manifest.devDependencies).filter((name) =>
  name.startsWith("@suites/"),
)) {
  assert(found.has(name), `Missing installed package: ${name}`);
}
const declarations = readFileSync(join(root, example, "global.d.ts"), "utf8");
const references = [...declarations.matchAll(/reference types="(@suites\/[^"]+)"/g)]
  .map((match) => match[1]);
const adapters = Object.keys(manifest.devDependencies).filter((name) =>
  name.startsWith("@suites/di.") || name.startsWith("@suites/doubles."),
);
assert.equal(adapters.length, 2, "Select one DI adapter and one doubles adapter");
assert.deepEqual(
  references.sort(),
  adapters.map((name) => `${name}/${name.startsWith("@suites/di.") ? "metadata" : "unit"}`).sort(),
  "global.d.ts must reference exactly the installed DI and doubles adapters",
);
for (const name of Object.keys(manifest.devDependencies).filter((name) => name.startsWith("@suites/"))) {
  assert.equal(manifest.devDependencies[name], expected.get(name), `Align ${name} with suites-versions.json`);
}
assert(found.has("@suites/core.unit"));
assert(found.has("@suites/types.di"));
assert(found.has("@suites/types.doubles"));
console.log(
  `${example}: verified ${found.size} Suites packages from the published v4.1 release`,
);
