import { Router } from 'express';
import { buscarPorTitulo } from '../controllers/cursosController.js';

const router = Router();

router.post('/buscar', buscarPorTitulo);

export default router;