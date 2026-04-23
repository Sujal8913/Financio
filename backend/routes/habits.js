const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isMongoAvailable, store, newId } = require('../config/memStore');
let Habit; try { Habit = require('../models/Habit'); } catch(e) {}

router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.json(await Habit.find({ user: req.user.id }).sort({ createdAt: -1 }));
    res.json(store.habits.filter(h => h.user === req.user.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)));
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.status(201).json(await Habit.create({ ...req.body, user: req.user.id }));
    const h = { id: newId(), _id: newId(), ...req.body, user: req.user.id, currentStreak: 0, longestStreak: 0, completedDates: [], isActive: true, createdAt: new Date() };
    store.habits.push(h);
    res.status(201).json(h);
  } catch(err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/check', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
      if (!habit) return res.status(404).json({ message: 'Not found' });
      const today = new Date(); today.setHours(0,0,0,0);
      const done = habit.completedDates.some(d => new Date(d).setHours(0,0,0,0) === today.getTime());
      if (!done) { habit.completedDates.push(new Date()); habit.currentStreak += 1; if (habit.currentStreak > habit.longestStreak) habit.longestStreak = habit.currentStreak; }
      await habit.save(); return res.json(habit);
    }
    const h = store.habits.find(h => (h.id === req.params.id || h._id === req.params.id) && h.user === req.user.id);
    if (!h) return res.status(404).json({ message: 'Not found' });
    const today = new Date(); today.setHours(0,0,0,0);
    const done = (h.completedDates||[]).some(d => new Date(d).setHours(0,0,0,0) === today.getTime());
    if (!done) { h.completedDates = [...(h.completedDates||[]), new Date()]; h.currentStreak = (h.currentStreak||0) + 1; if (h.currentStreak > (h.longestStreak||0)) h.longestStreak = h.currentStreak; }
    res.json(h);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const h = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
      if (!h) return res.status(404).json({ message: 'Not found' });
      return res.json(h);
    }
    const h = store.habits.find(h => (h.id === req.params.id || h._id === req.params.id) && h.user === req.user.id);
    if (!h) return res.status(404).json({ message: 'Not found' });
    Object.assign(h, req.body);
    res.json(h);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const h = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!h) return res.status(404).json({ message: 'Not found' });
      return res.json({ message: 'Deleted' });
    }
    const idx = store.habits.findIndex(h => (h.id === req.params.id || h._id === req.params.id) && h.user === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    store.habits.splice(idx, 1);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
