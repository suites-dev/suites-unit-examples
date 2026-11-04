import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "suites-source.json")));
const example = process.argv[2];
assert(
  config.examples.includes(example),
  "Select an example listed in suites-source.json",
);
const packed = JSON.parse(
  readFileSync(join(root, ".suites-packages/source.json")),
);
assert.deepEqual(
  packed,
  config,
  "Rebuild the tarballs for the configured source revision",
);
const expected = new Map(config.packages.map((pkg) => [pkg.name, pkg.version]));
const store = join(root, example, "node_modules/.pnpm");
const found = new Map();
for (const entry of readdirSync(store)) {
  const scope = join(store, entry, "node_modules/@suites");
  if (!existsSync(scope)) continue;
  for (const name of readdirSync(scope)) {
    const manifest = JSON.parse(
      readFileSync(join(scope, name, "package.json")),
    );
    assert(
      expected.has(manifest.name),
      `Unexpected Suites package: ${manifest.name}`,
    );
    assert.equal(
      manifest.version,
      expected.get(manifest.name),
      `Wrong version of ${manifest.name}`,
    );
    assert(
      !manifest.scripts?.postinstall,
      `${manifest.name} still has a postinstall hook`,
    );
    found.set(manifest.name, manifest.version);
  }
}
const manifest = JSON.parse(readFileSync(join(root, example, "package.json")));
for (const name of Object.keys(manifest.devDependencies).filter((name) =>
  name.startsWith("@suites/"),
)) {
  assert(found.has(name), `Missing installed package: ${name}`);
}
assert(found.has("@suites/core.unit"));
assert(found.has("@suites/types.di"));
assert(found.has("@suites/types.doubles"));
console.log(
  `${example}: verified ${found.size} Suites packages from ${config.commit}`,
);
