import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { GeminiController } from '../controllers/gemini.controller.js';

const router = Router();

// Primer mensaje personalizado (requiere sesión)
router.get('/intro', requireAuth, GeminiController.intro);

// Chat normal
router.post('/chat', requireAuth, GeminiController.chat);

export default router;
