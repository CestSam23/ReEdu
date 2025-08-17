import { consultarGemini } from '../config/gemini.js';

export const enviarPromptAGemini = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requerido' });
    }
    const respuesta = await consultarGemini(prompt);
    res.json(respuesta);
  } catch (error) {
    next(error);
  }
};