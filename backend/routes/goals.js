const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isMongoAvailable, store, newId } = require('../config/memStore');
let Goal; try { Goal = require('../models/Goal'); } catch(e) {}

router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.json(await Goal.find({ user: req.user.id }).sort({ createdAt: -1 }));
    const goals = store.goals.filter(g => g.user === req.user.id).map(g => ({
      ...g,
      progress: Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100)
    }));
    res.json(goals.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)));
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.status(201).json(await Goal.create({ ...req.body, user: req.user.id }));
    const g = { id: newId(), _id: newId(), ...req.body, user: req.user.id, currentAmount: 0, isCompleted: false, createdAt: new Date() };
    store.goals.push(g);
    res.status(201).json({ ...g, progress: 0 });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
      if (!goal) return res.status(404).json({ message: 'Not found' });
      if (req.body.addAmount) { goal.currentAmount = Math.min(goal.currentAmount + req.body.addAmount, goal.targetAmount); if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true; }
      else Object.assign(goal, req.body);
      await goal.save(); return res.json(goal);
    }
    const g = store.goals.find(g => (g.id === req.params.id || g._id === req.params.id) && g.user === req.user.id);
    if (!g) return res.status(404).json({ message: 'Not found' });
    if (req.body.addAmount) { g.currentAmount = Math.min((g.currentAmount||0) + req.body.addAmount, g.targetAmount); if (g.currentAmount >= g.targetAmount) g.isCompleted = true; }
    else Object.assign(g, req.body);
    res.json({ ...g, progress: Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const g = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!g) return res.status(404).json({ message: 'Not found' });
      return res.json({ message: 'Deleted' });
    }
    const idx = store.goals.findIndex(g => (g.id === req.params.id || g._id === req.params.id) && g.user === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    store.goals.splice(idx, 1);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
