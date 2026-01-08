const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const storyRoutes = require('./routes/stories');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Instagram Clone API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Instagram Clone API running on http://localhost:${PORT}`);
  console.log(`\n📱 Available Endpoints:`);
  console.log(`   Auth:`);
  console.log(`     POST /api/auth/register`);
  console.log(`     POST /api/auth/login`);
  console.log(`     GET  /api/auth/me`);
  console.log(`   Users:`);
  console.log(`     GET  /api/users/:username`);
  console.log(`     PUT  /api/users/profile`);
  console.log(`     POST /api/users/:id/follow`);
  console.log(`     DEL  /api/users/:id/follow`);
  console.log(`     GET  /api/users/feed/suggestions`);
  console.log(`   Posts:`);
  console.log(`     GET  /api/posts (feed)`);
  console.log(`     GET  /api/posts/explore`);
  console.log(`     POST /api/posts`);
  console.log(`     GET  /api/posts/:id`);
  console.log(`     DEL  /api/posts/:id`);
  console.log(`     POST /api/posts/:id/like`);
  console.log(`     POST /api/posts/:id/save`);
  console.log(`     POST /api/posts/:id/comment`);
  console.log(`   Stories:`);
  console.log(`     GET  /api/stories`);
  console.log(`     POST /api/stories`);
  console.log(`     GET  /api/stories/:id`);
  console.log(`     DEL  /api/stories/:id`);
  console.log(`\n✨ Ready to accept connections!\n`);
});
