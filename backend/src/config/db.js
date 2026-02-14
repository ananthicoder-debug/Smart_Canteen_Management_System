const mongoose = require('mongoose');
const { info, error } = require('../utils/logger');

const connectDB = async () => {
  const fallback = 'mongodb://127.0.0.1:27017/foodmanagement';
  const uri = process.env.MONGO_URI || fallback;
  if (!process.env.MONGO_URI) {
    info(`MONGO_URI not set; falling back to local MongoDB at ${fallback}`);
  }

  // Fast retry logic with small timeouts to keep startup quick
  const maxRetries = parseInt(process.env.DB_MAX_RETRIES, 10) || 3;
  const baseDelayMs = parseInt(process.env.DB_BASE_DELAY_MS, 10) || 200; // base delay

  // Use short server selection and connect timeouts so connect attempts fail fast
  const connectOptions = {
    dbName: 'foodmanagement',
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_MS, 10) || 3000,
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS, 10) || 3000,
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, connectOptions);
      info('MongoDB connected');
      return;
    } catch (err) {
      const expDelay = Math.min(baseDelayMs * Math.pow(2, attempt), 2000);
      // small jitter
      const jitter = Math.floor(Math.random() * Math.min(200, expDelay));
      const delay = expDelay + jitter;
      error(`MongoDB connection attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < maxRetries - 1) {
        info(`Retrying MongoDB connection in ${Math.round(delay / 1000)}s (attempt ${attempt + 2}/${maxRetries})`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, delay));
      } else {
        error('MongoDB connection failed after quick attempts. Starting app without DB to keep dev fast.');
        return;
      }
    }
  }
};

module.exports = connectDB;
