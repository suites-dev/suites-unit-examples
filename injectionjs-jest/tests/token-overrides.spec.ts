import 'reflect-metadata';
import { Inject, Injectable, InjectionToken } from 'injection-js';
import { TestBed } from '@suites/unit';
import { UserRepository } from '../src/user.repository';
import { DATABASE_TOKEN, type Database, type User } from '../src/types';

const PRIMARY_DATABASE = new InjectionToken<Database>('DATABASE');
const BACKUP_DATABASE = new InjectionToken<Database>('DATABASE');

@Injectable()
class DatabasePair {
  constructor(
    @Inject(PRIMARY_DATABASE) readonly primary: Database,
    @Inject(BACKUP_DATABASE) readonly backup: Database,
  ) {}
}

const user: User = { id: 1, email: 'alice@example.com', name: 'Alice', isActive: true };

describe('InjectionToken overrides', () => {
  it('configures a typed token mock and retrieves it for later changes', async () => {
    const { unit, unitRef } = await TestBed.solitary(UserRepository)
      .mock<Database>(DATABASE_TOKEN)
      .impl(stub => ({ findByEmail: stub().mockResolvedValue(user) }))
      .compile();

    await expect(unit.exists(user.email)).resolves.toBe(true);
    const database = unitRef.get<Database>(DATABASE_TOKEN);
    expect(database.findByEmail).toHaveBeenCalledWith(user.email);

    database.findByEmail.mockResolvedValue(null);
    await expect(unit.exists(user.email)).resolves.toBe(false);
  });

  it('injects a supplied value with final without exposing it as a mock', async () => {
    const supplied: Database = {
      findByEmail: async () => user,
      save: async value => value,
    };
    const { unit, unitRef } = await TestBed.solitary(UserRepository)
      .mock<Database>(DATABASE_TOKEN)
      .final(supplied)
      .compile();

    await expect(unit.findByEmail(user.email)).resolves.toBe(user);
    expect(() => unitRef.get<Database>(DATABASE_TOKEN)).toThrow();
  });

  it('keeps tokens with identical descriptions distinct', async () => {
    const { unit, unitRef } = await TestBed.solitary(DatabasePair)
      .mock<Database>(PRIMARY_DATABASE)
      .impl(stub => ({ findByEmail: stub().mockResolvedValue(user) }))
      .mock<Database>(BACKUP_DATABASE)
      .impl(stub => ({ findByEmail: stub().mockResolvedValue(null) }))
      .compile();

    await expect(unit.primary.findByEmail(user.email)).resolves.toBe(user);
    await expect(unit.backup.findByEmail(user.email)).resolves.toBeNull();
    expect(unitRef.get<Database>(PRIMARY_DATABASE)).not.toBe(
      unitRef.get<Database>(BACKUP_DATABASE),
    );
  });
});
