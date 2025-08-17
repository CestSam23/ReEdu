import { geminiPro, geminiVision } from '../services/gemini.service.js';

export class GeminiController {
  static generateText = async (req, res) => {
    const { prompt } = req.body;
    const { success, text, error } = await geminiPro.generateText(prompt);
    if (!success) return res.status(500).json({ error });
    res.json({ response: text });
  };

  static chat = async (req, res) => {
    const { message } = req.body;
    const { success, text, history } = await geminiPro.chat(message);
    if (!success) return res.status(500).json({ error: 'Error en Gemini' });
    res.json({ response: text, history });
  };

  static analyzeImage = async (req, res) => {
    try {
      const { buffer: fileBuffer, mimetype } = req.file;
      const { prompt } = req.body;
      
      const { success, text } = await geminiVision.processFile(
        fileBuffer,
        mimetype,
        prompt || 'Describe esta imagen'
      );

      if (!success) throw new Error();
      res.json({ analysis: text });
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar imagen' });
    }
  };
}