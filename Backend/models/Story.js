const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: [true, 'Story image is required']
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    },
    index: { expires: 0 } // TTL index - auto delete when expired
  }
}, {
  timestamps: true
});

// Index for fetching stories
StorySchema.index({ user: 1, createdAt: -1 });
StorySchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Story', StorySchema);
