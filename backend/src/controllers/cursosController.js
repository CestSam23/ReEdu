import Curso from '../models/curso.js';

export const buscarPorTitulo = async (req, res) => {
  try {
    const { titulo } = req.body;
    
    if (!titulo) {
      return res.status(400).json({ error: "Se requiere el parámetro 'titulo'" });
    }

    const cursos = await Curso.find({
      $or: [
        { title: { $regex: titulo, $options: 'i' } },
        { 'lessons.title': { $regex: titulo, $options: 'i' } }
      ]
    });

    if (cursos.length === 0) {
      return res.status(404).json({ 
        error: `No se encontraron cursos con "${titulo}"`,
        sugerencias: await Curso.distinct('title')
      });
    }

    res.json(cursos);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ 
      error: "Error en el servidor",
      detalle: error.message 
    });
  }
};