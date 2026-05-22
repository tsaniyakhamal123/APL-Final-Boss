import { Router } from 'express';
import notificationRoutes from './notificationRoutes.js';
import suratTugasRoutes from './suratTugasRoutes.js';
import testRoutes from './testRoutes.js';

const router = Router();
router.use('/', notificationRoutes);
router.use('/surat-tugas', suratTugasRoutes);
router.use('/test', testRoutes);
export default router;