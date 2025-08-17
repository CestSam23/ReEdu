import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cursosRoutes from './routes/cursosRoutes.js';

const app = express();

app.use(cors());
app.use(express.json()); // para leer JSON

app.use('/api/auth', authRoutes);

app.use('/api/cursos', cursosRoutes);

export default app;
