const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { isMongoAvailable, store } = require('../config/memStore');
let User; try { User = require('../models/User'); } catch(e) {}

router.use(protect, adminOnly);

router.get('/users', async (req, res) => {
  try {
    if (isMongoAvailable()) return res.json(await User.find({}).select('-password').sort({ createdAt: -1 }));
    res.json(store.users.map(({ password, ...u }) => u).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)));
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (isMongoAvailable()) {
      const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
      if (!u) return res.status(404).json({ message: 'Not found' });
      return res.json(u);
    }
    const u = store.users.find(u => u.id === req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    u.role = role;
    const { password, ...safe } = u;
    res.json(safe);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    if (isMongoAvailable()) { await User.findByIdAndDelete(req.params.id); return res.json({ message: 'Deleted' }); }
    const idx = store.users.findIndex(u => u.id === req.params.id);
    if (idx !== -1) store.users.splice(idx, 1);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const total = await User.countDocuments();
      const admins = await User.countDocuments({ role: 'admin' });
      return res.json({ totalUsers: total, adminUsers: admins, regularUsers: total - admins });
    }
    const total = store.users.length;
    const admins = store.users.filter(u => u.role === 'admin').length;
    res.json({ totalUsers: total, adminUsers: admins, regularUsers: total - admins });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
