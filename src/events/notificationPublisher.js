import { publisher } from '../config/redis.js';

export const publishEvent = async (channel, payload) => {
  const message = JSON.stringify(payload);
  await publisher.publish(channel, message);
  console.log(`[Publisher] Sent to channel "${channel}":`, payload);
};