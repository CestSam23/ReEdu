import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:5000/hackas', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB conectado en puerto 5000');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};