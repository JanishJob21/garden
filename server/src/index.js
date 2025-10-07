import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import registrationsRoutes from './routes/registrations.js';
import bookingsRoutes from './routes/bookings.js';
import toolsRoutes from './routes/tools.js';
import feedbackRoutes from './routes/feedback.js';
import sessionsRoutes from './routes/sessions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/sessions', sessionsRoutes);

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
