import User from '../models/User.js';

// Mapa del cuestionario en el front:
const QUESTION_DIM = [0,0,3,3,2,2, 4,4,1,1,5,5];   // índices 0..5 = R,I,A,S,E,C
const RIASEC_LABELS = ['R','I','A','S','E','C'];

// Esperamos cuerpo: { answers: [{ qIndex, optionIndex, optionText }...] }
// optionIndex: 0..4 (No me interesa → 0 ... Me interesa mucho → 4)
export const saveRiasecForm = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ ok: false, msg: 'answers vacío o inválido' });
    }

    // Recalcular puntaje por servidor
    const scores = { R:0, I:0, A:0, S:0, E:0, C:0 };
    const normalized = answers.map(({ qIndex, optionIndex, optionText }) => {
      if (typeof qIndex !== 'number' || typeof optionIndex !== 'number') {
        throw new Error('Formato de respuesta inválido');
      }
      const dimIdx = QUESTION_DIM[qIndex];
      const dim = RIASEC_LABELS[dimIdx] || 'R';
      const score = Math.max(0, Math.min(4, optionIndex)); // clamp 0..4

      scores[dim] += score;

      return {
        qIndex,
        optionIndex,
        optionText: optionText || '',
        score,
        dim
      };
    });

    const user = await User.findById(req.uid);
    if (!user) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });

    // Guardamos historial (puedes sobreescribir si quieres solo último)
    user.riasecAnswers = normalized;
    user.riasecScores = scores;
    user.riasecCompletedAt = new Date();
    await user.save();

    return res.json({ ok: true, scores, count: normalized.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: 'Error al guardar formulario' });
  }
};
