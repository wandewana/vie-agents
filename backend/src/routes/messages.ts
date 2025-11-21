import express from 'express';
import { MessageModel } from '../models/Message';
import { UserModel } from '../models/User';
import { GroupModel } from '../models/Group';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Send a direct message
router.post('/direct', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { recipient_id, content } = req.body;
    const sender_id = req.user!.userId;

    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    // Check if recipient exists
    const recipient = await UserModel.findById(recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Create message
    const message = await MessageModel.create({
      content,
      sender_id,
      recipient_id,
    });

    const messageWithUser = await MessageModel.findById(message.id);

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithUser,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a group message
router.post('/group', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { group_id, content } = req.body;
    const sender_id = req.user!.userId;

    if (!group_id || !content) {
      return res.status(400).json({ error: 'Group ID and content are required' });
    }

    // Check if group exists and user is a member
    const group = await GroupModel.findById(group_id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = await GroupModel.isMember(group_id, sender_id);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Create message
    const message = await MessageModel.create({
      content,
      sender_id,
      group_id,
    });

    const messageWithUser = await MessageModel.findById(message.id);

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithUser,
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get direct messages between two users
router.get('/direct/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const otherUserId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;

    // Check if other user exists
    const otherUser = await UserModel.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await MessageModel.getDirectMessages(currentUserId, otherUserId, limit);

    res.json({
      messages,
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        email: otherUser.email,
      },
    });
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group messages
router.get('/group/:groupId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const groupId = parseInt(req.params.groupId);
    const limit = parseInt(req.query.limit as string) || 50;

    // Check if group exists and user is a member
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = await GroupModel.isMember(groupId, userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const messages = await MessageModel.getGroupMessages(groupId, limit);

    res.json({
      messages,
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
      },
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user conversations
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const conversations = await MessageModel.getUserConversations(userId);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;