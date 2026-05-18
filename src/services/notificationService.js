import * as repo from '../repositories/notificationRepo.js';

export const processNotification = async ({ event_id, user_id, user_email, type, subject, message }) => {
  // Idempotency: skip kalau sudah pernah diproses
  const existing = await repo.findByEventId(event_id);
  if (existing) {
    console.log(`[Idempotency] Event ${event_id} sudah diproses, skip.`);
    return null;
  }

  // Simpan ke DB dengan status PENDING
  const notification = await repo.createNotification({
    event_id, user_id, user_email, type, subject, message
  });

  // TODO: kirim email via emailService.js
  // await sendEmail({ to: user_email, subject, message });

  // Update status jadi SENT
  await repo.markAsSent(event_id);

  console.log(`[Notify] ${type} untuk ${user_email} berhasil diproses`);
  return notification;
};