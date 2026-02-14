const mongoose = require('mongoose');

const connectDB = async () => {
  const fallback = 'mongodb://127.0.0.1:27017/innowah-common';
  const uri = process.env.MONGO_URI || fallback;

  const maxRetries = parseInt(process.env.DB_MAX_RETRIES, 10) || 3;
  const baseDelayMs = parseInt(process.env.DB_BASE_DELAY_MS, 10) || 200;

  const connectOptions = {
    dbName: process.env.MONGO_DB_NAME || 'innowah-common',
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_MS, 10) || 3000,
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS, 10) || 3000,
  };

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      await mongoose.connect(uri, connectOptions);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const expDelay = Math.min(baseDelayMs * Math.pow(2, attempt), 2000);
      const jitter = Math.floor(Math.random() * Math.min(200, expDelay));
      const delay = expDelay + jitter;
      console.error(`MongoDB connection attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < maxRetries - 1) {
        console.log(`Retrying MongoDB connection in ${Math.round(delay / 1000)}s (attempt ${attempt + 2}/${maxRetries})`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('MongoDB connection failed after quick attempts. Starting app without DB to keep dev fast.');
        return;
      }
    }
  }
};

module.exports = connectDB;
