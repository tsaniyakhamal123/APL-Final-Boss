import express from 'express';
import { startSubscriber } from './events/notificationSubscriber.js';
import notificationRoutes from './controllers/notificationController.js';
import { connectRedis } from './config/redis.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes REST API
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Start Redis subscriber (dengerin event dari kelompok lain)
const start = async () => {
  await connectRedis();
  startSubscriber();
  app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });
};

start();