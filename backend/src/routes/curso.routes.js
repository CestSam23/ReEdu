import { Router } from 'express';
import { busquedaGlobal, sugerencias } from '../controllers/cursosController.js';

const router = Router();

router.post('/buscar', busquedaGlobal);   // ⬅️ aquí el cambio
router.post('/sugerencias', sugerencias); // opcional si añadiste este endpoint

export default router;
