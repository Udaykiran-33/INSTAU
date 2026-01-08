const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// @route   GET /api/posts
// @desc    Get feed posts (from followed users)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts from users the current user follows + their own posts
    const following = [...req.user.following, req.user._id];

    const posts = await Post.find({ user: { $in: following } })
      .populate('user', 'username avatar name verified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username avatar' },
        options: { limit: 2, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ user: { $in: following } });

    res.json({
      success: true,
      data: posts.map(post => ({
        ...post.toObject(),
        isLiked: post.likes.includes(req.user._id),
        isSaved: post.savedBy.includes(req.user._id)
      })),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/posts/explore
// @desc    Get explore posts (discover new content)
// @access  Public
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'username avatar verified')
      .sort({ likesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: posts.map(post => ({
        ...post.toObject(),
        isLiked: req.user ? post.likes.includes(req.user._id) : false
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { caption, location } = req.body;
    
    let imageUrl = req.body.image; // Accept URL directly
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const post = await Post.create({
      user: req.user._id,
      image: imageUrl,
      caption,
      location
    });

    await post.populate('user', 'username avatar name verified');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar name verified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username avatar' },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked: req.user ? post.likes.includes(req.user._id) : false,
        isSaved: req.user ? post.savedBy.includes(req.user._id) : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like or unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes.pull(req.user._id);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likesCount: post.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/posts/:id/save
// @desc    Save or unsave a post
// @access  Private
router.post('/:id/save', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isSaved = post.savedBy.includes(req.user._id);

    if (isSaved) {
      post.savedBy.pull(req.user._id);
    } else {
      post.savedBy.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      data: { isSaved: !isSaved }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      user: req.user._id,
      post: post._id,
      text: text.trim()
    });

    post.comments.push(comment._id);
    await post.save();

    await comment.populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:postId/comment/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: comment._id }
    });

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
