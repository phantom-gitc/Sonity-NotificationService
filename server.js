import app from './src/app.js';
import { connectRabbitMQ } from './src/broker/rabbit.js';
import startListener from './src/broker/listener.js';

// Start the notification service

async function startNotificationService() {

    
  await connectRabbitMQ();
  await startListener();


  app.listen(3001, () => {
    console.log('Notification service is running on port 3001 🔔');
  });
}


// Handle startup errors

startNotificationService().catch((error) => {
  console.error('Notification service failed to start:', error);
  process.exit(1);
});