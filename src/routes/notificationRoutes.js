import { Router } from 'express';
import { getAll } from '../controllers/notificationController.js';
const router = Router();
router.get('/', getAll);
export default router;