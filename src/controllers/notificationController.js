import { getAllNotifications } from '../repositories/notificationRepo.js';

export const getAll = async (req, res) => {
  try {
    const data = await getAllNotifications();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};