import express from 'express';
import { GroupModel } from '../models/Group';
import { UserModel } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Create a new group
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user!.userId;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await GroupModel.create({
      name,
      description,
      created_by,
    });

    // Add creator as a member
    await GroupModel.addMember(group.id, created_by);

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all groups
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groups = await GroupModel.findAll();
    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's groups
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const groups = await GroupModel.findByUser(userId);
    res.json({ groups });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = await GroupModel.getMembers(groupId);

    res.json({
      group,
      members,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a group
router.post('/:id/join', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const userId = req.user!.userId;

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if already a member
    const isMember = await GroupModel.isMember(groupId, userId);
    if (isMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    await GroupModel.addMember(groupId, userId);

    res.json({
      message: 'Joined group successfully',
      group,
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave a group
router.post('/:id/leave', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const userId = req.user!.userId;

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the creator
    if (group.created_by === userId) {
      return res.status(400).json({ error: 'Group creator cannot leave the group' });
    }

    // Check if user is a member
    const isMember = await GroupModel.isMember(groupId, userId);
    if (!isMember) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    await GroupModel.removeMember(groupId, userId);

    res.json({
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to group (only group creator can do this)
router.post('/:id/members', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const { user_id } = req.body;
    const currentUserId = req.user!.userId;

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if current user is the group creator
    if (group.created_by !== currentUserId) {
      return res.status(403).json({ error: 'Only group creator can add members' });
    }

    // Check if user exists
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const isMember = await GroupModel.isMember(groupId, user_id);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    await GroupModel.addMember(groupId, user_id);

    res.json({
      message: 'Member added successfully',
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;