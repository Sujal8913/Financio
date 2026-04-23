const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isMongoAvailable, store, newId } = require('../config/memStore');

let User;
try { User = require('../models/User'); } catch(e) {}

const generateToken = (user) =>
  jwt.sign({ id: user._id || user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    if (isMongoAvailable()) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
      return res.status(201).json({ token: generateToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    const exists = store.users.find(u => u.email === email);
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const hashedPw = await bcrypt.hash(password, 10);
    const userRole = store.users.length === 0 ? 'admin' : (role === 'admin' ? 'admin' : 'user');
    const user = { id: newId(), name, email, password: hashedPw, role: userRole, currency: 'USD', avatar: '', createdAt: new Date() };
    store.users.push(user);
    res.status(201).json({ token: generateToken({...user, _id: user.id}), user: { id: user.id, name, email, role: userRole } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    if (isMongoAvailable()) {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
      return res.json({ token: generateToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken({...user, _id: user.id}), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  try {
    if (isMongoAvailable()) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    const user = store.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/me', protect, async (req, res) => {
  try {
    const { name, currency, avatar } = req.body;
    if (isMongoAvailable()) {
      const user = await User.findByIdAndUpdate(req.user.id, { name, currency, avatar }, { new: true }).select('-password');
      return res.json(user);
    }
    const idx = store.users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    if (name !== undefined) store.users[idx].name = name;
    if (currency !== undefined) store.users[idx].currency = currency;
    if (avatar !== undefined) store.users[idx].avatar = avatar;
    const { password, ...safe } = store.users[idx];
    res.json(safe);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
