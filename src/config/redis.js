import { createClient } from 'redis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const publisher = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

const subscriber = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

const connectRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
  console.log('Redis Publisher & Subscriber connected');
};

export { publisher, subscriber, connectRedis };