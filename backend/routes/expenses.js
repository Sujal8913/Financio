const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isMongoAvailable, store, newId } = require('../config/memStore');
let Expense; try { Expense = require('../models/Expense'); } catch(e) {}

router.use(protect);

router.get('/summary', async (req, res) => {
  try {
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    let expenses;
    if (isMongoAvailable()) {
      expenses = await Expense.find({ user: req.user.id, date: { $gte: startOfMonth } });
    } else {
      expenses = store.expenses.filter(e => e.user === req.user.id && new Date(e.date) >= startOfMonth);
    }
    const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((s,e) => s+e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((s,e) => s+e.amount, 0);
    const byCategory = expenses.reduce((acc,e) => { if (e.type==='expense') acc[e.category]=(acc[e.category]||0)+e.amount; return acc; }, {});
    res.json({ totalExpenses, totalIncome, balance: totalIncome - totalExpenses, byCategory });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { category, type, limit = 50, page = 1 } = req.query;
    if (isMongoAvailable()) {
      const filter = { user: req.user.id };
      if (category) filter.category = category;
      if (type) filter.type = type;
      const expenses = await Expense.find(filter).sort({ date: -1 }).limit(parseInt(limit)).skip((parseInt(page)-1)*parseInt(limit));
      const total = await Expense.countDocuments(filter);
      return res.json({ expenses, total, page: parseInt(page) });
    }
    let list = store.expenses.filter(e => e.user === req.user.id);
    if (category) list = list.filter(e => e.category === category);
    if (type) list = list.filter(e => e.type === type);
    list.sort((a,b) => new Date(b.date)-new Date(a.date));
    const total = list.length;
    const start = (parseInt(page)-1)*parseInt(limit);
    res.json({ expenses: list.slice(start, start+parseInt(limit)), total, page: parseInt(page) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.status(201).json(await Expense.create({ ...req.body, user: req.user.id }));
    const e = { id: newId(), _id: newId(), ...req.body, user: req.user.id, date: req.body.date ? new Date(req.body.date) : new Date(), createdAt: new Date() };
    store.expenses.push(e);
    res.status(201).json(e);
  } catch(err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const e = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!e) return res.status(404).json({ message: 'Not found' });
      return res.json({ message: 'Deleted' });
    }
    const idx = store.expenses.findIndex(e => (e.id === req.params.id || e._id === req.params.id) && e.user === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    store.expenses.splice(idx, 1);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
