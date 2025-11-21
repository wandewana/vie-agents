import pool from '../database';

export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { email, password, username } = userData;
    const result = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *',
      [email, password, username]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT id, email, username, created_at FROM users ORDER BY username');
    return result.rows;
  }

  static async searchUsers(query: string, excludeUserId?: number): Promise<User[]> {
    let sql = `
      SELECT id, email, username, created_at
      FROM users
      WHERE (username ILIKE $1 OR email ILIKE $1)
    `;
    const params = [`%${query}%`];

    if (excludeUserId) {
      sql += ' AND id != $2';
      params.push(excludeUserId.toString());
    }

    sql += ' ORDER BY username LIMIT 10';

    const result = await pool.query(sql, params);
    return result.rows;
  }
}