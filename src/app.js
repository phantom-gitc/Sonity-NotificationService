import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { createRateLimiter, securityHeaders } from './middlewares/security.middlewares.js';

const app = express();

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

app.use(securityHeaders);
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, service: 'notification', status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ success: true, service: 'notification', status: 'ready' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

app.use((error, req, res, next) => {
  console.error('Notification global error handler:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: config.NODE_ENV === 'development' ? error : {},
  });
});

export default app;
