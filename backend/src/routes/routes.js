import { Router } from 'express';
import { saveRiasecForm } from '../controllers/form.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Guarda el formulario completo (protegido por JWT)
router.post('/riasec', requireAuth, saveRiasecForm);

export default router;
