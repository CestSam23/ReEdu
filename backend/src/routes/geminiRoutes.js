import { Router } from 'express';
import { enviarPromptAGemini } from '../controllers/geminiController.js';

const router = Router();

router.post('/prompt', enviarPromptAGemini);

export default router;