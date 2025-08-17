import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import geminiRoutes from './routes/geminiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/gemini', geminiRoutes);
app.use(errorHandler);

export default app;