import pool from '../database';

export interface User {
  id: number;
  password: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  password: string;
  username: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { password, username } = userData;
    const result = await pool.query(
      'INSERT INTO users (password, username) VALUES ($1, $2) RETURNING *',
      [password, username]
    );
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT id, username, created_at FROM users ORDER BY username');
    return result.rows;
  }

  static async searchUsers(query: string, excludeUserId?: number): Promise<User[]> {
    let sql = `
      SELECT id, username, created_at
      FROM users
      WHERE username ILIKE $1
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