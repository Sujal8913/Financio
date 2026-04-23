const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  category: {
    type: String,
    enum: ['emergency', 'vacation', 'car', 'house', 'education', 'retirement', 'other'],
    default: 'other',
  },
  color: { type: String, default: '#10b981' },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

goalSchema.virtual('progress').get(function () {
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
