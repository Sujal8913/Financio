const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['saving', 'investing', 'budgeting', 'debt', 'learning', 'other'],
    default: 'other',
  },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  targetAmount: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedDates: [{ type: Date }],
  isActive: { type: Boolean, default: true },
  color: { type: String, default: '#3b82f6' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Habit', habitSchema);
