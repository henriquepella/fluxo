import type { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
