const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

connectDB();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, service: 'food-backend' }));

// Health check: returns DB connection state and basic service info
const mongoose = require('mongoose');
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/health', (req, res) => {
	const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
	res.json({ ok: true, mongodb: state === 1 ? 'connected' : 'disconnected', state });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

module.exports = app;
