import mongoose from 'mongoose';

// Esquema flexible para cualquier estructura de curso
const cursoSchema = new mongoose.Schema({}, { 
  strict: false, // ← Permite cualquier estructura
  timestamps: true 
});

// Índice de texto para todos los campos string
cursoSchema.index({ "$**": "text" });

export default mongoose.model('Curso', cursoSchema);