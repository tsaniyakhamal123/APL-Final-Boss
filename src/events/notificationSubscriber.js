import { subscriber } from '../config/redis.js';
import { processNotification } from '../services/notificationService.js';
import { generateSuratTugas } from '../services/suratTugasService.js';

const CHANNELS = [
  'bidding:status_changed',   // Kelompok 2
  'project:new_match',        // Kelompok 3
  'team:formed',              // Kelompok 3 — trigger generate Surat Tugas
];

export const startSubscriber = async () => {
  console.log(`Subscribing to channels:`, CHANNELS);

  for (const channel of CHANNELS) {
    // Di Redis v4, callback dipanggil langsung saat subscribe
    await subscriber.subscribe(channel, async (message) => {
      console.log(`[Redis] Event dari "${channel}":`, message);
      
      try {
        const payload = JSON.parse(message);

        if (channel === 'bidding:status_changed') {
          const { event_id, user_id, user_email, status, project_title } = payload;
          const type = status === 'ACCEPTED' ? 'BIDDING_ACCEPTED' : 'BIDDING_REJECTED';
          const subject = `Bidding kamu ${status === 'ACCEPTED' ? 'diterima ✅' : 'ditolak ❌'} — ${project_title}`;
          const msg = `Halo, bidding kamu untuk proyek "${project_title}" telah ${status}.`;
          await processNotification({ event_id, user_id, user_email, type, subject, message: msg });
        }

        if (channel === 'project:new_match') {
          const { event_id, user_id, user_email, project_title, required_skills } = payload;
          const subject = `Ada proyek baru yang cocok buatmu — ${project_title}`;
          const msg = `Halo, ada proyek baru "${project_title}" yang butuh skill: ${required_skills?.join(', ')}.`;
          await processNotification({ event_id, user_id, user_email, type: 'NEW_PROJECT_MATCH', subject, message: msg });
        }

        // AUTO-GENERATE Surat Tugas saat tim terbentuk
        if (channel === 'team:formed') {
          await generateSuratTugas(payload);
          console.log('[Subscriber] Surat Tugas berhasil digenerate dari event Redis!');
        }

      } catch (err) {
        console.error('[Redis] Error processing message:', err);
      }
    });
  }
};