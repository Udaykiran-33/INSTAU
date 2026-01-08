const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Story = require('../models/Story');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Configure multer for story uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `story-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are allowed'));
  }
});

// @route   GET /api/stories
// @desc    Get stories from followed users
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get stories from users the current user follows + their own
    const following = [...req.user.following, req.user._id];

    // Get unique users who have stories
    const usersWithStories = await Story.aggregate([
      {
        $match: {
          user: { $in: following },
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: '$user',
          stories: { $push: '$$ROOT' },
          latestStory: { $max: '$createdAt' }
        }
      },
      { $sort: { latestStory: -1 } }
    ]);

    // Populate user info
    const populatedStories = await User.populate(usersWithStories, {
      path: '_id',
      select: 'username avatar name verified'
    });

    const result = populatedStories.map(item => ({
      user: item._id,
      stories: item.stories.map(story => ({
        ...story,
        isViewed: story.viewers.some(v => v.toString() === req.user._id.toString())
      })),
      hasUnviewed: item.stories.some(
        story => !story.viewers.some(v => v.toString() === req.user._id.toString())
      )
    }));

    // Put current user's stories first if they exist
    const currentUserIndex = result.findIndex(
      item => item.user._id.toString() === req.user._id.toString()
    );
    if (currentUserIndex > 0) {
      const [currentUserStories] = result.splice(currentUserIndex, 1);
      result.unshift(currentUserStories);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/stories
// @desc    Create a new story
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const story = await Story.create({
      user: req.user._id,
      image: imageUrl
    });

    await story.populate('user', 'username avatar name');

    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/stories/:id
// @desc    View a story (marks as viewed)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('user', 'username avatar name verified');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or expired'
      });
    }

    // Mark as viewed if not already
    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({
      success: true,
      data: {
        ...story.toObject(),
        viewersCount: story.viewers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story'
      });
    }

    await story.deleteOne();

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/stories/:id/viewers
// @desc    Get story viewers
// @access  Private
router.get('/:id/viewers', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('viewers', 'username avatar name');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only story owner can view viewers'
      });
    }

    res.json({
      success: true,
      data: story.viewers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
