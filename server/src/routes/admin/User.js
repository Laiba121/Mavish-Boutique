import express from 'express';
import User from '../../model/User.js';
import { protect, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// 👥 GET ALL USERS (ADMIN VIEW)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/count', protect, adminOnly, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👤 GET SINGLE USER
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ UPDATE USER
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ allow ONLY status update
    if (req.body.status) {
      user.status = req.body.status;
    }

    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ❌ DELETE USER
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ❌ prevent deleting yourself (important safety)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't delete yourself" });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;