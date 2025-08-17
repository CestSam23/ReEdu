import mongoose from 'mongoose';

// Esquema flexible para cualquier estructura
const cursoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true
});

// Índice de texto para TODOS los campos string
// (necesario para $text; créalo en Atlas/Compass si no existe)
cursoSchema.index({ "$**": "text" });

export default mongoose.model('Curso', cursoSchema);
