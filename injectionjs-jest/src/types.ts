import { InjectionToken } from 'injection-js';

export interface User {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

export const DATABASE_TOKEN = new InjectionToken<Database>('DATABASE');

export interface Database {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
