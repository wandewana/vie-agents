import express from 'express';
import { UserModel } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Search users
router.get('/search', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user!.userId;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await UserModel.searchUsers(q, currentUserId);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (for testing/development)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await UserModel.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;