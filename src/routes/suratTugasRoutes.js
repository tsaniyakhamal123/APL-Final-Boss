import { Router } from 'express';
import { getAll, download, generate } from '../controllers/suratTugasController.js';
const router = Router();
router.get('/', getAll);
router.get('/:id/download', download);
router.post('/generate', generate);
export default router;