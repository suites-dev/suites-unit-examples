# Suites + InversifyJS + Jest

Simple user management example demonstrating [Suites](https://suites.dev) with InversifyJS and Jest.

## Prerequisites

- Node.js 22.22.2+, 24.15.0+, or 26.x
- pnpm 12.16.1
- Published Suites v4 packages (installed by the commands below)

## What This Demonstrates

- ✅ **Solitary unit tests** - Test UserService in complete isolation
- ✅ **Sociable unit tests** - Test components together with real validation, mocked I/O
- ✅ **Token injection** - DATABASE_TOKEN as external boundary
- ✅ **Class injection** - UserValidator and UserRepository

## Running the Example

```bash
pnpm install --frozen-lockfile
pnpm test
```

All tests should pass, demonstrating both solitary and sociable testing strategies.

## Project Structure

**`src/`** - Application code being tested:

```
src/
├── types.ts              # User types and interfaces
├── user.validator.ts     # Validation logic (no dependencies)
├── user.repository.ts    # Data access (token injection)
└── user.service.ts       # Business logic (class injections)
```

**`tests/`** - Tests demonstrating Suites usage:

```
tests/
├── user.solitary.spec.ts # Solitary unit tests (all dependencies mocked)
└── user.sociable.spec.ts # Sociable unit tests (real collaborators)
```

## Key Patterns

### Solitary Unit Tests

Tests one class in complete isolation. All dependencies are mocked.

```typescript
const { unit, unitRef } = await TestBed.solitary(UserService).compile();
const repository: Mocked<UserRepository> = unitRef.get(UserRepository);
repository.exists.mockResolvedValue(false);
```

### Sociable Unit Tests

Tests multiple classes together with real collaborators. External I/O remains mocked.

```typescript
const { unit, unitRef } = await TestBed.sociable(UserService)
  .expose(UserValidator)
  .expose(UserRepository)
  .compile();
const database = unitRef.get<Database>(DATABASE_TOKEN);
```

## Comparing Testing Strategies

**When to use Solitary:**

- Testing component logic in isolation
- Controlling all inputs for predictable results
- Dependencies are slow or complex to set up

**When to use Sociable:**

- Verifying components work together correctly
- Testing interactions between business logic components
- Dependencies are fast

## Related Examples

- [InjectionJS + Jest](../injectionjs-jest) - Constructor injection with typed tokens
- [InjectionJS + Vitest](../injectionjs-vitest) - Token injection with Vitest

- [inversify-vitest](../inversify-vitest) - Same framework with Vitest (faster execution)
- [nestjs-jest](../nestjs-jest) - NestJS with Jest

## Learn More

- [Suites Documentation](https://suites.dev)
- [InversifyJS Integration](https://suites.dev/docs/get-started/installation/)
- [Testing Strategies](https://suites.dev/docs/guides/)

## Type references

The included `global.d.ts` loads both the test-double types and the DI metadata types:

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.inversify/metadata" />
```

Keep this file included in your test `tsconfig.json`. Suites 4 does not modify declaration files during installation.
