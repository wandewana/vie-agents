import pool from '../database';

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: Date;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  created_by: number;
}

export class GroupModel {
  static async create(groupData: CreateGroupData): Promise<Group> {
    const { name, description, created_by } = groupData;
    const result = await pool.query(
      'INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description, created_by]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Group | null> {
    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Group[]> {
    const result = await pool.query('SELECT * FROM groups ORDER BY name');
    return result.rows;
  }

  static async findByUser(userId: number): Promise<Group[]> {
    const result = await pool.query(
      `SELECT g.* FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.name`,
      [userId]
    );
    return result.rows;
  }

  static async addMember(groupId: number, userId: number): Promise<GroupMember> {
    const result = await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) RETURNING *',
      [groupId, userId]
    );
    return result.rows[0];
  }

  static async removeMember(groupId: number, userId: number): Promise<void> {
    await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
  }

  static async getMembers(groupId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY u.username`,
      [groupId]
    );
    return result.rows;
  }

  static async isMember(groupId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    return result.rows.length > 0;
  }
}