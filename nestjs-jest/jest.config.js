module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.spec.ts"],
  transform: {
    "^.+\\.m?js$": ["@swc/jest", { module: { type: "commonjs" } }],
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
          parser: { syntax: "typescript", decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
        },
        module: { type: "commonjs" },
      },
    ],
  },
  // Compile ESM dependencies for CommonJS tests, including on Node 22.
  transformIgnorePatterns: [
    "/node_modules/(?!(?:\\.pnpm/)?(?:@suites[+/]|inversify|@inversifyjs[+/]|@nestjs[+/]|uuid))",
  ],
  collectCoverageFrom: ["src/**/*.ts", "!src/types.ts"],
};
