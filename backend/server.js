require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { setMongoAvailable, isMongoAvailable } = require('./config/memStore');

const app = express();

// ── MongoDB Connection with retry ─────────────────────────────────────────────
const connectWithRetry = (attempt = 1) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env file!');
    setMongoAvailable(false);
    return;
  }

  console.log(`🔄 Attempting MongoDB connection (attempt ${attempt})...`);

  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,  // 30 seconds — Atlas needs time on cold start
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      setMongoAvailable(true);
    })
    .catch((err) => {
      // Print the REAL error so you know what's wrong
      console.error(`❌ MongoDB Connection Failed (attempt ${attempt}): ${err.message}`);
      if (attempt < 3) {
        console.log(`⏳ Retrying in 5 seconds...`);
        setTimeout(() => connectWithRetry(attempt + 1), 5000);
      } else {
        console.log('⚠️  MongoDB unavailable — using in-memory store');
        setMongoAvailable(false);
      }
    });
};

connectWithRetry();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/goals', require('./routes/goals'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Financio API is running',
    database: isMongoAvailable() ? 'MongoDB' : 'In-Memory',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error('Error:', err.message, err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Financio API running on http://localhost:${PORT}`));
