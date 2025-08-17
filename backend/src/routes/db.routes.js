import express from 'express';
import { DBController } from '../controllers/db.controller.js';

const router = express.Router();

// Ruta dinámica para cualquier modelo
export const createModelRoutes = (modelName) => {
  const controller = new DBController(modelName);
  
  router.post(`/${modelName}`, controller.create);
  router.get(`/${modelName}`, controller.findAll);
  router.get(`/${modelName}/:id`, controller.findOne);
  router.patch(`/${modelName}/:id`, controller.update);
  router.delete(`/${modelName}/:id`, controller.delete);
  
  return router;
};

// Ejemplo para modelo 'Curso'
export const cursoRoutes = createModelRoutes('Curso');