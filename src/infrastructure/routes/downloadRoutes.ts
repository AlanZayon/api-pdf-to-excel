import { Router } from 'express';
import { DownloadController } from '../controllers/downloadController';

const router = Router();

router.get('/download', DownloadController.downloadFile);

export default router;
