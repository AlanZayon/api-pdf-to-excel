// src/infrastructure/routes/uploadRoutes.ts
import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { UploadController } from '../controllers/UploadController';

const router = Router();
const controller = new UploadController();

router.post('/upload', upload.single('pdfFile'), controller.handle.bind(controller));

export default router;
