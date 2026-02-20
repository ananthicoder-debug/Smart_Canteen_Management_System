const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const salesRoutes = require('./routes/sales.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();

connectDB();

const defaultOrigins = ['http://localhost:5000', 'http://localhost:8000', 'http://localhost:8001'];
const originList = (process.env.FRONTEND_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
const allowedOrigins = originList.length ? originList : defaultOrigins;

app.use(helmet());
app.use(compression());
app.use(cookieParser());
const corsOptions = {
  origin: (origin, callback) => {
    // For development, always allow localhost origins
    if (!origin || origin.includes('localhost') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, service: 'common-backend' }));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(errorHandler);

module.exports = app;
