import express from 'express';
import { MessageModel } from '../models/Message';
import { GroupModel } from '../models/Group';
import { UserModel } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { socketManager } from '../index';

const router = express.Router();

// API Automation Endpoints
// These endpoints are designed for programmatic access and automation

// Send a message (supports both direct and group messages)
router.post('/messages', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { content, recipient_id, group_id } = req.body;
    const sender_id = req.user!.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Validate that either recipient_id OR group_id is provided, but not both
    if ((!recipient_id && !group_id) || (recipient_id && group_id)) {
      return res.status(400).json({
        error: 'Either recipient_id (for direct message) or group_id (for group message) must be provided, but not both'
      });
    }

    let message;

    if (recipient_id) {
      // Send direct message
      const recipient = await UserModel.findById(recipient_id);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      message = await MessageModel.create({
        content,
        sender_id,
        recipient_id,
      });
    } else {
      // Send group message
      const group = await GroupModel.findById(group_id!);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const isMember = await GroupModel.isMember(group_id!, sender_id);
      if (!isMember) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }

      message = await MessageModel.create({
        content,
        sender_id,
        group_id,
      });
    }

    const messageWithUser = await MessageModel.findById(message.id);

    // Broadcast message via socket
    if (socketManager && messageWithUser) {
      if (recipient_id) {
        // Direct message - emit to both sender and recipient
        socketManager.emitToUser(sender_id, 'new_direct_message', messageWithUser);
        socketManager.emitToUser(recipient_id, 'new_direct_message', messageWithUser);
      } else {
        // Group message - emit to all group members
        socketManager.emitToGroup(group_id!, 'new_group_message', messageWithUser);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithUser,
    });
  } catch (error) {
    console.error('Send message automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create a new group
router.post('/groups', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, member_ids } = req.body;
    const created_by = req.user!.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required'
      });
    }

    // Create the group
    const group = await GroupModel.create({
      name,
      description,
      created_by,
    });

    // Add creator as a member
    await GroupModel.addMember(group.id, created_by);

    // Add additional members if provided
    if (member_ids && Array.isArray(member_ids)) {
      for (const member_id of member_ids) {
        try {
          const user = await UserModel.findById(member_id);
          if (user && user.id !== created_by) {
            await GroupModel.addMember(group.id, member_id);
          }
        } catch (error) {
          console.error(`Failed to add member ${member_id}:`, error);
        }
      }
    }

    const members = await GroupModel.getMembers(group.id);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group,
        members,
      },
    });
  } catch (error) {
    console.error('Create group automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's conversations
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const conversations = await MessageModel.getUserConversations(userId);

    res.json({
      success: true,
      data: {
        conversations,
        total: conversations.length,
      },
    });
  } catch (error) {
    console.error('Get conversations automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get messages from a conversation
router.get('/conversations/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const conversationId = parseInt(req.params.id);
    const { type = 'direct', limit = 50 } = req.query;

    if (type !== 'direct' && type !== 'group') {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "direct" or "group"'
      });
    }

    let messages;
    let metadata;

    if (type === 'direct') {
      // Check if this is a valid conversation for the user
      const conversations = await MessageModel.getUserConversations(userId);
      const isValidConversation = conversations.some(
        conv => conv.type === 'direct' && conv.other_user_id === conversationId
      );

      if (!isValidConversation) {
        return res.status(403).json({
          success: false,
          error: 'You are not part of this conversation'
        });
      }

      const response = await MessageModel.getDirectMessages(userId, conversationId, parseInt(limit as string));
      messages = response;
      metadata = {
        type: 'direct',
        other_user_id: conversationId,
      };
    } else {
      // Group conversation
      const group = await GroupModel.findById(conversationId);
      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Group not found'
        });
      }

      const isMember = await GroupModel.isMember(conversationId, userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You are not a member of this group'
        });
      }

      const response = await MessageModel.getGroupMessages(conversationId, parseInt(limit as string));
      messages = response;
      metadata = {
        type: 'group',
        group_id: conversationId,
        group_name: group.name,
      };
    }

    res.json({
      success: true,
      data: {
        messages,
        metadata,
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Get conversation messages automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user information
router.get('/users/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Get user info automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check for automation
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      service: 'AI Chatter Automation API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

export default router;