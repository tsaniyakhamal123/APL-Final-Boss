import { Router } from 'express';
import { testPublish } from '../controllers/testController.js';
const router = Router();
router.post('/', testPublish);
export default router;