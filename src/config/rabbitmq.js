import amqp from 'amqplib';

const RABBITMQ_URL   = process.env.RABBITMQ_URL          || 'amqp://guest:guest@localhost:5672';
const EXCHANGE       = process.env.RABBITMQ_EXCHANGE      || 'tracker.events';
const EXCHANGE_TYPE  = process.env.RABBITMQ_EXCHANGE_TYPE || 'topic';

let channel = null;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
  console.log(`[RabbitMQ] Connected — exchange: ${EXCHANGE}`);
  return channel;
};

export const getChannel = () => {
  if (!channel) throw new Error('Channel belum siap');
  return channel;
};

export { EXCHANGE };