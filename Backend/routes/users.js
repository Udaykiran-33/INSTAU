const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-email')
      .populate('followers', 'username avatar name')
      .populate('following', 'username avatar name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('image likes comments');

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        posts,
        postsCount: posts.length,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile (text fields)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, website, avatar } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (avatar !== undefined) updateData.avatar = avatar;

    console.log('📝 Updating profile:', updateData);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Profile updated:', user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    console.log('✅ Avatar updated:', avatarUrl);

    res.json({
      success: true,
      data: {
        avatar: avatarUrl,
        user
      }
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to followers and following
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user._id }
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id }
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from followers and following
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id }
    });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar name bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get user suggestions
// @access  Private
router.get('/feed/suggestions', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Get users not followed by current user
    const suggestions = await User.find({
      _id: { 
        $nin: [...currentUser.following, currentUser._id] 
      }
    })
    .select('username avatar name bio followers verified')
    .limit(5);

    res.json({
      success: true,
      data: suggestions.map(user => ({
        ...user.toObject(),
        followersCount: user.followers.length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
