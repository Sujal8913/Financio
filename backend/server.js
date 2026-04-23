require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { setMongoAvailable, isMongoAvailable } = require('./config/memStore');

const app = express();

// ── Serverless-safe MongoDB connection caching ────────────────────────────────
// Vercel serverless functions reuse warm instances — cache the connection
// to avoid creating a new one on every request.
let isConnecting = false;

const connectWithRetry = async (attempt = 1) => {
  // If already connected, reuse the connection
  if (mongoose.connection.readyState === 1) {
    setMongoAvailable(true);
    return;
  }

  // If a connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined!');
    setMongoAvailable(false);
    return;
  }

  if (isConnecting) return;
  isConnecting = true;

  console.log(`🔄 Connecting to MongoDB (attempt ${attempt})...`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    setMongoAvailable(true);
  } catch (err) {
    console.error(`❌ MongoDB Failed (attempt ${attempt}): ${err.message}`);
    if (attempt < 3) {
      isConnecting = false;
      await new Promise(r => setTimeout(r, 3000));
      return connectWithRetry(attempt + 1);
    } else {
      console.log('⚠️  Using in-memory fallback store');
      setMongoAvailable(false);
    }
  } finally {
    isConnecting = false;
  }
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
