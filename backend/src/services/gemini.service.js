import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMINI_API_KEY;
if (!apiKey) {
  console.error("[gemini] Falta GEMINI_API_KEY en el backend (.env)");
}
const genAI = new GoogleGenerativeAI(apiKey);

// SUGERENCIA: prueba con un modelo actual
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"; // "gemini-pro" puede no estar disponible en tu cuenta/region

function clean(t=""){ return String(t).trim(); }

export const geminiPro = {
  async generateText(prompt){
    try{
      if (!apiKey) return { success:false, error:"GEMINI_API_KEY no configurada" };
      const model = genAI.getGenerativeModel({ model: MODEL });
      const r = await model.generateContent(prompt);
      const text = clean(r?.response?.text() || "");
      if (!text) {
        console.warn("[gemini.generateText] Sin texto. RAW:", r?.response);
      }
      return { success: !!text, text, error: text ? null : "Respuesta vacía" };
    }catch(e){
      console.error("[gemini.generateText] Error:", e?.message);
      return { success:false, error: e?.message || "Error desconocido" };
    }
  },
  async chat(message, history=[]){
    try{
      if (!apiKey) return { success:false, error:"GEMINI_API_KEY no configurada" };
      const model = genAI.getGenerativeModel({ model: MODEL });
      const contents = [
        ...history.map(h => ({ role: h.role, parts: [{ text: clean(h.text) }]})),
        { role:"user", parts:[{ text: clean(message) }]}
      ];
      const r = await model.generateContent({ contents });
      const text = clean(r?.response?.text() || "");
      if (!text) {
        console.warn("[gemini.chat] Sin texto. RAW:", r?.response);
      }
      return { success: !!text, text, history: [...history, { role:"assistant", text }] };
    }catch(e){
      console.error("[gemini.chat] Error:", e?.message);
      return { success:false, error: e?.message || "Error desconocido" };
    }
  }
};
