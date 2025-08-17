import mongoose from 'mongoose';

const cursoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  resources: [{
    type: { type: String, enum: ['video', 'pdf', 'image'] },
    url: String
  }],
  riasec: {
    R: Number, I: Number, A: Number,
    S: Number, E: Number, C: Number
  },
  lessons: [{
    title: String,
    content: String,
    quiz: {
      questions: [{
        type: { type: String, enum: ['single', 'multiple'] },
        prompt: String,
        options: [String],
        answer: String
      }]
    }
  }]
}, { timestamps: true });

export default mongoose.model('Curso', cursoSchema);