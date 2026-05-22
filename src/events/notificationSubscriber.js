import { connectRabbitMQ, EXCHANGE } from '../config/rabbitmq.js';
import { processNotification } from '../services/notificationService.js';
import { generateSuratTugas } from '../services/suratTugasService.js';

const BINDINGS = [
  'bidding.project.created',
  'bidding.bid.status.updated',
  'bidding.bid.deal.confirmed',
  'bidding.bid.counter.offered',
];

export const startSubscriber = async () => {
  const channel = await connectRabbitMQ();

  const { queue } = await channel.assertQueue('notification_service_queue', { durable: true });

  for (const routingKey of BINDINGS) {
    await channel.bindQueue(queue, EXCHANGE, routingKey);
  }

  console.log('[RabbitMQ] Subscribed to:', BINDINGS);

  channel.consume(queue, async (msg) => {
    if (!msg) return;
    const routingKey = msg.fields.routingKey;
    try {
      const payload = JSON.parse(msg.content.toString());
      console.log(`[RabbitMQ] Event [${routingKey}]:`, payload);
      await handleEvent(routingKey, payload);
      channel.ack(msg);
    } catch (err) {
      console.error(`[RabbitMQ] Error [${routingKey}]:`, err.message);
      channel.nack(msg, false, false);
    }
  });
};

const handleEvent = async (routingKey, payload) => {
  switch (routingKey) {

    case 'bidding.project.created': {
      const { project_id, client_id, client_name, email, project_title } = payload;
      await processNotification({
        event_id: `project_created_${project_id}`,
        user_id: client_id,
        user_email: email,
        type: 'PROJECT_CREATED',
        subject: `Proyek "${project_title}" berhasil dibuat ✅`,
        message: `Halo ${client_name}, proyek "${project_title}" kamu berhasil dibuat dan kini terbuka untuk bidding.`,
      });
      break;
    }

    case 'bidding.bid.status.updated': {
      const { user_id, status, project_title } = payload;
      const accepted = status === 'Accepted';
      await processNotification({
        event_id: `bid_status_${user_id}_${Date.now()}`,
        user_id,
        user_email: payload.user_email || '',
        type: 'BID_STATUS_UPDATE',
        subject: `Bid kamu ${accepted ? 'diterima ✅' : 'ditolak ❌'} — ${project_title}`,
        message: `Halo, bid kamu untuk proyek "${project_title}" telah ${accepted ? 'diterima' : 'ditolak'}.`,
      });
      break;
    }

    case 'bidding.bid.deal.confirmed': {
      const { deal_id, project_id, project_title, mitra_id, deal_amount, timeline } = payload;
      await processNotification({
        event_id: `deal_mitra_${deal_id}`,
        user_id: mitra_id,
        user_email: payload.mitra_email || '',
        type: 'DEAL_CONFIRMED',
        subject: `Deal confirmed — "${project_title}" 🤝`,
        message: `Deal untuk proyek "${project_title}" dikonfirmasi. Nilai: Rp ${Number(deal_amount).toLocaleString('id-ID')}. Estimasi selesai: ${timeline?.estimated_completion}.`,
      });

      if (payload.members) {
        await generateSuratTugas({
          event_id: `surat_${deal_id}`,
          project_id,
          project_title,
          members: payload.members,
        });
      }
      break;
    }

    case 'bidding.bid.counter.offered': {
      const { user_id, project_title } = payload;
      await processNotification({
        event_id: `counter_${user_id}_${Date.now()}`,
        user_id,
        user_email: payload.user_email || '',
        type: 'COUNTER_OFFER',
        subject: `Ada counter offer baru — "${project_title}"`,
        message: `Pihak lain mengirimkan counter offer untuk proyek "${project_title}". Silakan cek dan berikan respons.`,
      });
      break;
    }

    default:
      console.warn(`[RabbitMQ] Routing key tidak dikenali: ${routingKey}`);
  }
};