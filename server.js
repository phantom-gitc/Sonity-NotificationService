import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './src/app.js';
import config from './src/config/config.js';
import { closeRabbitMQ, connectRabbitMQ } from './src/broker/rabbit.js';
import startListener from './src/broker/listener.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

function readCookie(cookieHeader, name) {
  return cookieHeader
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)?.[1];
}

// Socket connections must prove identity with the same JWT used by APIs.
io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const cookieToken = readCookie(socket.handshake.headers.cookie, 'token');
    const token = authToken || cookieToken;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(decodeURIComponent(token), config.JWT_SECRET);
    socket.user = {
      id: decoded.id,
      fullName: decoded.fullName,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next(new Error('Invalid socket authentication token'));
  }
});

// Configure Socket.io real-time user room actions
io.on('connection', (socket) => {
  console.log('A device connected:', socket.id);

  // Join the user's secure room on identification
  socket.on('identify', (userId) => {
    if (userId && String(userId) === String(socket.user.id)) {
      socket.userId = String(socket.user.id);
      socket.join(socket.userId);
      console.log(`Device ${socket.id} joined room for user: ${socket.userId}`);
    }
  });

  // Relay playback events (play, pause, volume, progress, queue) to all other devices of the same user
  socket.on('playback_action', (data) => {
    if (socket.userId) {
      socket.to(socket.userId).emit('playback_sync', data);
      console.log(`Relayed playback action [${data.type}] for user: ${socket.userId}`);
    }
  });

  // Relay generic state update events (likes, playlist edits, profile changes) to refresh state in real-time
  socket.on('ui_action', (data) => {
    if (socket.userId) {
      socket.to(socket.userId).emit('ui_sync', data);
      console.log(`Relayed UI refresh action [${data.type}] for user: ${socket.userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('A device disconnected:', socket.id);
  });
});

async function startNotificationService() {
  await connectRabbitMQ();
  await startListener();

  server.listen(config.PORT, () => {
    console.log(`Notification service with Socket.io is running on port ${config.PORT} 🔔`);
  });
}

// Gracefully closes socket, HTTP, and broker connections during deploy restarts.
async function shutdown(signal) {
  console.log(`${signal} received. Shutting down Notification service...`);
  io.close();
  server.close();
  await closeRabbitMQ().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle startup errors
startNotificationService().catch((error) => {
  console.error('Notification service failed to start:', error);
  process.exit(1);
});
