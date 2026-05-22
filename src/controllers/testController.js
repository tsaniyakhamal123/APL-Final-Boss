import { getChannel, EXCHANGE } from '../config/rabbitmq.js';

export const testPublish = async (req, res) => {
  try {
    const { routingKey, payload } = req.body;
    if (!routingKey || !payload) return res.status(400).json({ success: false, message: 'routingKey dan payload wajib' });
    const channel = getChannel();
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
    res.json({ success: true, message: `Published ke [${routingKey}]` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};