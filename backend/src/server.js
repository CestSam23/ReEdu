import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Ajusta según tu estructura

import app from './app.js';
import { connectDB } from './config/db.config.js';
import { geminiPro } from './services/gemini.service.js';

const PORT = process.env.PORT || 5000;

// 1. Conectar a MongoDB
const startServer = async () => {
  try {
    await connectDB();
    
    // 2. Validar conexión con Gemini
    const geminiTest = await geminiPro.generateContent('Conexión de prueba');
    if (!geminiTest.success) throw new Error('❌ Gemini no responde');

    // 3. Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Servidor operativo en http://localhost:${PORT}`);
      console.log(`🛡️  Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  MongoDB: ${mongoose.connection.host}`);
      console.log(`🧠 Gemini: ${geminiTest.success ? 'Conectado' : 'Error'}`);
      console.log('='.repeat(50) + '\n');
      
      // Mostrar rutas disponibles (opcional)
      console.log('Endpoints disponibles:');
      app._router.stack.forEach(r => {
        if (r.route?.path) {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase());
          console.log(`- ${methods.join('|')} ${r.route.path}`);
        }
      });
    });

  } catch (error) {
    console.error('⛔ Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Manejar cierre elegante
process.on('SIGTERM', () => {
  console.log('🔻 Recibido SIGTERM. Cerrando servidor...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', err => {
  console.error('💥 Error no manejado:', err);
  mongoose.connection.close();
});

startServer();