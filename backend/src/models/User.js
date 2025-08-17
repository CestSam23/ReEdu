import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const answerSchema = new mongoose.Schema({
  qIndex: { type: Number, required: true },        // índice de la pregunta
  optionIndex: { type: Number, required: true },   // 0..4 según OPTIONS
  optionText: { type: String, required: true },    // "No me interesa", etc.
  score: { type: Number, required: true },         // 0..4 según tu mapa
  dim: { type: String, enum: ['R','I','A','S','E','C'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  lang:     { type: String, default: 'es' },
  access:   {
    highContrast: { type: Boolean, default: false },
    easyRead:     { type: Boolean, default: true }
  },

  // ====== CUESTIONARIO RIASEC ======
  riasecScores: {
    R: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    E: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
  },
  riasecAnswers: { type: [answerSchema], default: [] }, // historial de respuestas
  riasecCompletedAt: { type: Date },                    // fecha de finalización (opcional)

  createdAt: { type: Date, default: Date.now }
});

// Hash pre-save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
