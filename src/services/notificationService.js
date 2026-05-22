import * as repo from '../repositories/notificationRepo.js';
import { sendEmail } from './emailService.js';

export const processNotification = async ({ event_id, user_id, user_email, type, subject, message }) => {
  const existing = await repo.findByEventId(event_id);
  if (existing) {
    console.log(`[Idempotency] ${event_id} sudah diproses, skip.`);
    return null;
  }

  const notification = await repo.createNotification({ event_id, user_id, user_email, type, subject, message });

  if (user_email) {
    try {
      await sendEmail({ to: user_email, subject, text: message });
      await repo.markAsSent(event_id);
      console.log(`[Notify] ${type} → ${user_email} ✅`);
    } catch (err) {
      await repo.markAsFailed(event_id);
      console.error(`[Notify] Gagal kirim email:`, err.message);
    }
  } else {
    await repo.markAsSent(event_id);
  }

  return notification;
};