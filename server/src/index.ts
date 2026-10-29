import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { initializeSocket } from './services/socketService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Security & Body Parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Initialize Socket.IO
initializeSocket(server, CORS_ORIGIN);

// 3. Health & System Status Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'RideX Mobility Core API',
    version: '1.0.0',
    demoMode: process.env.ENABLE_DEMO_MODE === 'true',
    timestamp: new Date().toISOString(),
  });
});

// 4. API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/driver', driverRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/geocode', geocodeRoutes);

// 5. 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Requested API endpoint not found on RideX server',
  });
});

// 6. Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 RideX Server running on port ${PORT}`);
    console.log(`📡 Socket.IO listening for real-time ride tracking`);
    console.log(`🚕 Demo Mode: ${process.env.ENABLE_DEMO_MODE === 'true' ? 'Active' : 'Disabled'}`);
  });
}

export { app, server };
