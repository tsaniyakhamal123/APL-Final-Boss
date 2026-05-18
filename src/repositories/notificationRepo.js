import pool from '../config/db.js';

export const findByEventId = async (event_id) => {
  const result = await pool.query(
    'SELECT id FROM notifications WHERE event_id = $1',
    [event_id]
  );
  return result.rows[0] || null;
};

export const createNotification = async ({ event_id, user_id, user_email, type, subject, message }) => {
  const result = await pool.query(
    `INSERT INTO notifications (event_id, user_id, user_email, type, subject, message, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING *`,
    [event_id, user_id, user_email, type, subject, message]
  );
  return result.rows[0];
};

export const markAsSent = async (event_id) => {
  await pool.query(
    `UPDATE notifications SET status = 'SENT', sent_at = NOW()
     WHERE event_id = $1`,
    [event_id]
  );
};

export const markAsFailed = async (event_id) => {
  await pool.query(
    `UPDATE notifications SET status = 'FAILED'
     WHERE event_id = $1`,
    [event_id]
  );
};

export const getAllNotifications = async () => {
  const result = await pool.query(
    'SELECT * FROM notifications ORDER BY created_at DESC'
  );
  return result.rows;
};