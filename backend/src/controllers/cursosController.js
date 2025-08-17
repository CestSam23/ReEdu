import Curso from '../models/Curso.js';

// Busca en TODOS los campos del documento
export const busquedaGlobal = async (req, res) => {
  try {
    const { termino } = req.body;
    
    if (!termino) {
      return res.status(400).json({ error: "Se requiere el parámetro 'termino'" });
    }

    // Búsqueda en todos los campos de texto
    const resultados = await Curso.aggregate([
      {
        $match: {
          $text: { $search: termino }
        }
      },
      {
        $addFields: {
          // Destaca los matches encontrados
          matches: {
            $reduce: {
              input: { $objectToArray: "$$ROOT" },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $cond: {
                      if: { 
                        $and: [
                          { $eq: [ { $type: "$$this.v" }, "string" ] },
                          { $gt: [ 
                            { $indexOfCP: [ 
                              { $toLower: "$$this.v" }, 
                              { $toLower: termino } 
                            ] }, 
                            -1 
                          ] }
                        ]
                      },
                      then: [{
                        campo: "$$this.k",
                        valor: "$$this.v",
                        // Extrae el fragmento relevante
                        fragmento: {
                          $substrCP: [
                            "$$this.v",
                            { $max: [
                              0,
                              { $subtract: [
                                { $indexOfCP: [ 
                                  { $toLower: "$$this.v" }, 
                                  { $toLower: termino } 
                                ] },
                                20
                              ] }
                            ] },
                            { $add: [ { $strLenCP: termino }, 40 ] }
                          ]
                        }
                      }],
                      else: []
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $project: { matches: 1, title: 1, description: 1 } }
    ]);

    if (resultados.length === 0) {
      return res.status(404).json({ 
        error: `No se encontraron coincidencias para "${termino}"`,
        sugerencias: await obtenerSugerencias(termino)
      });
    }

    res.json(resultados);
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ 
      error: "Error en el servidor",
      detalle: error.message 
    });
  }
};

// Helper para sugerencias
async function obtenerSugerencias(termino) {
  const sugerencias = await Curso.aggregate([
    { $match: { $text: { $search: termino } } },
    { $project: { _id: 0, title: 1 } },
    { $limit: 5 }
  ]);
  return sugerencias.map(s => s.title);
}