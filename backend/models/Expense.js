const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['food', 'transport', 'housing', 'entertainment', 'health', 'shopping', 'utilities', 'other'],
    default: 'other',
  },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
