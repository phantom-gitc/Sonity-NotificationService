import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { connectRabbitMQ } from './src/broker/rabbit.js';
import startListener from './src/broker/listener.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure Socket.io real-time user room actions
io.on('connection', (socket) => {
  console.log('A device connected:', socket.id);

  // Join the user's secure room on identification
  socket.on('identify', (userId) => {
    if (userId) {
      socket.userId = userId;
      socket.join(userId);
      console.log(`Device ${socket.id} joined room for user: ${userId}`);
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

  server.listen(3001, () => {
    console.log('Notification service with Socket.io is running on port 3001 🔔');
  });
}

// Handle startup errors
startNotificationService().catch((error) => {
  console.error('Notification service failed to start:', error);
  process.exit(1);
});