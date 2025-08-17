import express from 'express';
import multer from 'multer';
import { GeminiController } from '../controllers/gemini.controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/generate', GeminiController.generateText);
router.post('/chat', GeminiController.chat);
router.post('/analyze-image', upload.single('image'), GeminiController.analyzeImage);

export default router;