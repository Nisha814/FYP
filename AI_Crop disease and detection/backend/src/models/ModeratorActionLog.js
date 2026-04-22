const mongoose = require('mongoose');

const moderatorActionLogSchema = new mongoose.Schema({
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  actionType: {
    type: String,
    enum: ['delete_post', 'resolve_report', 'dismiss_report'],
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

moderatorActionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ModeratorActionLog', moderatorActionLogSchema);
