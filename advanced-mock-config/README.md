# Suites + NestJS + Jest: Mock Configuration

Compare `.mock().final()` and `.mock().impl()` in solitary and sociable tests using the same user service as the other examples.

## Run

Use Node.js `^22.22.2 || ^24.15.0 || ^26.0.0` and pnpm 12.16.1. From this directory:

```sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm test
```

The example installs published Suites v4 packages, checks TypeScript with `skipLibCheck: false`, and runs eleven tests. Each test gets a fresh TestBed.

## Supply a value with `.final()`

```typescript
const { unit } = await TestBed.solitary(UserService)
  .mock(UserValidator)
  .final({ validate: () => ({ isValid: true, errors: [] }) })
  .compile();
```

Suites injects the supplied implementation without generating a mock. It does not freeze the value or prevent you from changing an object you hold. Final dependencies cannot be retrieved through `unitRef`.

These examples supply plain functions, so they have no Jest call tracking or `mockReturnValue()` API. That follows from the supplied functions; `.final()` itself does not remove mock capabilities from values you supply.

## Configure a mock with `.impl()`

```typescript
const { unit, unitRef } = await TestBed.solitary(UserService)
  .mock(UserValidator)
  .impl(stub => ({
    validate: stub().mockReturnValue({ isValid: true, errors: [] }),
  }))
  .compile();

const validator = unitRef.get(UserValidator);
validator.validate.mockReturnValue({ isValid: false, errors: ['Invalid email'] });
```

Use the callback's `stub` factory to configure behavior before compilation. Retrieve the mock through `unitRef` to change behavior or assert calls later.

| Pattern | Use when | Available through `unitRef` |
| --- | --- | --- |
| `.final(value)` | You want to supply a value or implementation | No |
| `.impl(factory)` | You want a configurable mock with initial behavior | Yes |

## Read the tests

- `tests/user.solitary.spec.ts`: supplies or mocks the validator while mocking the repository.
- `tests/user.sociable.spec.ts`: exposes the real validator and repository, then supplies or mocks the database token.

Application code is in `src/`. Neither test style calls an external database.

## Type references

The included `global.d.ts` loads:

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/metadata" />
```

Keep it included in your test tsconfig. Suites v4 does not patch declarations during installation.

## Next steps

- [Mock Configuration API](https://suites.dev/docs/api-reference/mock-configuration/)
- [NestJS + Jest](../nestjs-jest)
- [InjectionJS token overrides](../injectionjs-jest/tests/token-overrides.spec.ts)
- [All examples](../README.md)
