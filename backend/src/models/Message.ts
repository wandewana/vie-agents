import pool from '../database';

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  created_at: Date;
}

export interface CreateMessageData {
  content: string;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
}

export interface MessageWithUser extends Message {
  sender_username: string;
  sender_email: string;
}

export class MessageModel {
  static async create(messageData: CreateMessageData): Promise<Message> {
    const { content, sender_id, recipient_id, group_id } = messageData;
    const result = await pool.query(
      'INSERT INTO messages (content, sender_id, recipient_id, group_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, sender_id, recipient_id, group_id]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<MessageWithUser | null> {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_username, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getDirectMessages(user1Id: number, user2Id: number, limit = 50): Promise<MessageWithUser[]> {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_username, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE ((m.sender_id = $1 AND m.recipient_id = $2) OR
              (m.sender_id = $2 AND m.recipient_id = $1))
       ORDER BY m.created_at DESC
       LIMIT $3`,
      [user1Id, user2Id, limit]
    );
    return result.rows.reverse(); // Reverse to get chronological order
  }

  static async getGroupMessages(groupId: number, limit = 50): Promise<MessageWithUser[]> {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_username, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.group_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [groupId, limit]
    );
    return result.rows.reverse(); // Reverse to get chronological order
  }

  static async getUserConversations(userId: number): Promise<any[]> {
    // Get direct message conversations
    const dmResult = await pool.query(
      `SELECT DISTINCT
         CASE
           WHEN m.sender_id = $1 THEN m.recipient_id
           ELSE m.sender_id
         END as other_user_id,
         u.username as other_username,
         u.email as other_email,
         MAX(m.created_at) as last_message_at,
         'direct' as type
       FROM messages m
       JOIN users u ON (
         CASE
           WHEN m.sender_id = $1 THEN m.recipient_id
           ELSE m.sender_id
         END = u.id
       )
       WHERE (m.sender_id = $1 OR m.recipient_id = $1)
         AND m.group_id IS NULL
       GROUP BY other_user_id, u.username, u.email
       ORDER BY last_message_at DESC`,
      [userId]
    );

    // Get group conversations
    const groupResult = await pool.query(
      `SELECT
         g.id as other_user_id,
         g.name as other_username,
         g.description as other_email,
         MAX(m.created_at) as last_message_at,
         'group' as type
       FROM messages m
       JOIN groups g ON m.group_id = g.id
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       GROUP BY g.id, g.name, g.description
       ORDER BY last_message_at DESC`,
      [userId]
    );

    return [...dmResult.rows, ...groupResult.rows];
  }
}