import { query } from '../config/database';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const role = input.role || UserRole.USER;
  const result = await query(
    `INSERT INTO users (email, password, name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id, email, password, role, name, created_at as "createdAt", updated_at as "updatedAt"`,
    [input.email, input.password, input.name, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, password, role, name, created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, password, role, name, created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};
