import express from 'express';
import { startSubscriber } from './events/notificationSubscriber.js';
import routes from './routes/index.js';
import 'dotenv/config';
// import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/notifications', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
});

const start = async () => {
  await startSubscriber();
  app.listen(PORT, () => console.log(`[App] Running on port ${PORT}`));
};

start().catch((err) => {
  console.error('[App] Fatal startup error:', err);
  process.exit(1);
});