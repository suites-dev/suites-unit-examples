# Suites + InjectionJS + Vitest

Test the same user service as the NestJS and Inversify examples using InjectionJS constructor injection and `InjectionToken<Database>`.

## Run

Use Node.js `^22.22.2 || ^24.15.0 || ^26.0.0` and pnpm 12.16.1. From this directory:

```sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm test
```

The command type-checks with `skipLibCheck: false` and runs nine tests. Dependencies come from npm: Suites 4.1 and InjectionJS `^2.6.1`.

## Explore the example

| File | What it demonstrates |
| --- | --- |
| `src/types.ts` | Domain interfaces and the exported `DATABASE_TOKEN` |
| `src/user.repository.ts` | `@Inject(DATABASE_TOKEN)` constructor dependency |
| `src/user.service.ts` | Class dependencies on the repository and validator |
| `tests/user.solitary.spec.ts` | All collaborators mocked |
| `tests/user.sociable.spec.ts` | Real validator and repository, mocked database |
| `tests/token-overrides.spec.ts` | Typed `.impl()` / `.final()` overrides and token identity |

## Type references

The included `global.d.ts` loads:

```typescript
/// <reference types="@suites/doubles.vitest/unit" />
/// <reference types="@suites/di.injectionjs/metadata" />
```

Keep the file included in your test tsconfig. The DI reference registers `InjectionToken<T>` and disables metadata arguments for InjectionJS. Use an explicit dependency type:

```typescript
const database = unitRef.get<Database>(DATABASE_TOKEN);
```

Import the original token from `src/types.ts`. Two `InjectionToken` instances with identical descriptions are separate dependencies.

## Runner configuration

Decorator metadata is enabled in both the TypeScript and SWC configurations. The source imports `reflect-metadata` before decorated classes.

The Vitest example uses ESM. Keep this setting inside `test` in `vitest.config.ts`:

```typescript
server: { deps: { external: ['injection-js'] } },
```

It ensures the adapter and test code use the same native InjectionJS module and preserve decorator and token identity.

## Scope

This adapter supports constructor injection. Contextual `inject()` calls, including field initializers, are not supported. Suites does not reproduce production provider factories, multi-providers, or injector hierarchies. `@Optional()`, `@Self()`, `@SkipSelf()`, and `@Host()` do not reproduce production lookup rules.

## Next steps

- [InjectionJS guide](https://suites.dev/docs/guides/injectionjs/)
- [Mock configuration](https://suites.dev/docs/api-reference/mock-configuration/)
- [All examples](../README.md)
