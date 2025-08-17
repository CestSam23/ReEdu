import User from '../models/User.js';
import { geminiPro } from '../services/gemini.service.js';

// Heurística simple para fortalezas/debilidades
function summarizeGrades(grades=[]){
  if (!grades.length) return { best:[], worst:[], avg: null };

  const avg = Math.round(grades.reduce((a,g)=>a+(g.score/(g.total||100)*100),0)/grades.length);
  const norm = grades.map(g => ({ name: g.courseName || g.courseId || 'Curso', score: Math.round(g.score/(g.total||100)*100) }));
  const sorted = [...norm].sort((a,b)=>b.score-a.score);
  return {
    best:  sorted.slice(0,3),
    worst: sorted.slice(-3).reverse(),
    avg
  };
}

function riasecRecommendation(scores={}){
  // Ordena de mayor a menor
  const entries = Object.entries(scores || {}).map(([k,v]) => [k, Number(v||0)]);
  entries.sort((a,b)=>b[1]-a[1]);
  const top = entries.slice(0,2).map(e=>e[0]).join('-') || 'N/A';

  // Reglas simples
  const map = {
    R: 'Práctico/Técnico',
    I: 'Científico/Analítico',
    A: 'Creativo/Artístico',
    S: 'Social/Educativo',
    E: 'Negocios/Liderazgo',
    C: 'Administrativo/Procesos'
  };

  return {
    code: top,
    label: entries.length ? `${map[entries[0][0]] || entries[0][0]} + ${map[entries[1]?.[0]] || ''}`.trim() : 'Sin datos',
    ordered: entries // [['I',12],['A',8],...]
  };
}

export class GeminiController {
  // Primer mensaje personalizado
  static intro = async (req, res) => {
    try{
      const userId = req.userId;
      const user = await User.findById(userId).lean();
      if (!user) return res.status(404).json({ ok:false, msg:'Usuario no encontrado' });

      const { name, email, riasecScores = {}, grades = [] } = user;
      const gsum = summarizeGrades(grades);
      const rrec = riasecRecommendation(riasecScores);

      const strengthsTxt = gsum.best.map(b=>`• ${b.name}: ${b.score}%`).join('\n') || '—';
      const weaknessesTxt = gsum.worst.map(w=>`• ${w.name}: ${w.score}%`).join('\n') || '—';
      const riasecTxt = rrec.ordered.map(([k,v])=>`${k}:${v}`).join(', ') || '—';

      // Prompt en español
      const prompt = `
Eres un asesor académico. Resume en español para el estudiante:
Nombre: ${name}
Correo: ${email}
Promedio general (aprox): ${gsum.avg ?? 'sin datos'}
Fortalezas (mejores 3):
${strengthsTxt}
Áreas de oportunidad (peores 3):
${weaknessesTxt}
Perfil RIASEC: ${riasecTxt}
Combinación sugerida: ${rrec.code} (${rrec.label})

1) Escribe un párrafo corto con sus fortalezas.
2) Un párrafo corto con sus áreas a mejorar y tips concretos (bullet points).
3) Recomienda una "rama" o área de estudio coherente con su RIASEC y calificaciones, y sugiere 3 siguientes temas para estudiar.
Usa tono motivador, directo y claro.`;

      const { success, text, error } = await geminiPro.generateText(prompt);
      if (!success) return res.status(500).json({ ok:false, msg:error });

      return res.json({
        ok: true,
        intro: text,
        meta: {
          avg: gsum.avg,
          strengths: gsum.best,
          weaknesses: gsum.worst,
          riasec: riasecScores,
          riasecCombo: rrec
        }
      });
    }catch(e){
      console.error(e);
      return res.status(500).json({ ok:false, msg:'Error en intro' });
    }
  };

  // Chat normal
  static chat = async (req, res) => {
    try{
      const { message, history=[] } = req.body || {};
      const { success, text, history: h2 } = await geminiPro.chat(message, history);
      if (!success) return res.status(500).json({ ok:false, msg:'Error en Gemini' });
      res.json({ ok:true, reply: text, history: h2 });
    }catch(e){
      console.error(e);
      res.status(500).json({ ok:false, msg:'Error en chat' });
    }
  };
}
