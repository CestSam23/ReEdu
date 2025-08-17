import Curso from '../models/Curso.js';

// Busca en TODOS los campos del documento
export const busquedaGlobal = async (req, res) => {
  try {
    const { termino, page = 1, limit = 10 } = req.body || {};
    if (!termino || typeof termino !== 'string') {
      return res.status(400).json({ ok: false, error: "Se requiere el parámetro 'termino' (string)" });
    }

    const pg = Math.max(1, parseInt(page, 10));
    const lm = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pg - 1) * lm;

    // --------- PRIMER INTENTO: $text (requiere índice de texto) ----------
    let pipeline = [
      { $match: { $text: { $search: termino } } },
      { $addFields: { score: { $meta: "textScore" } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: lm },
      // matches (fragmentos) en todos los campos string:
      {
        $addFields: {
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
                          {
                            $gt: [
                              {
                                $indexOfCP: [
                                  { $toLower: "$$this.v" },
                                  { $toLower: termino }
                                ]
                              },
                              -1
                            ]
                          }
                        ]
                      },
                      then: [{
                        campo: "$$this.k",
                        valor: "$$this.v",
                        fragmento: {
                          $substrCP: [
                            "$$this.v",
                            {
                              $max: [
                                0,
                                {
                                  $subtract: [
                                    {
                                      $indexOfCP: [
                                        { $toLower: "$$this.v" },
                                        { $toLower: termino }
                                      ]
                                    },
                                    20
                                  ]
                                }
                              ]
                            },
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
      {
        $project: {
          score: 1,
          matches: 1,
          // Devuelve los campos típicos; como el esquema es flexible, puedes devolver todo:
          // descomenta la siguiente línea para devolver el documento completo
          // doc: "$$ROOT"
          // o elige campos frecuentes:
          title: 1, description: 1, resources: 1, lessons: 1, type: 1, url: 1, nodeLabel: 1, categoryId: 1, categoryName: 1, createdAt: 1
        }
      }
    ];

    let items = await Curso.aggregate(pipeline);
    // Cuenta total (para paginación simple):
    const totalText = await Curso.countDocuments({ $text: { $search: termino } });

    // --------- FALLBACK: Regex case-insensitive sobre algunos campos ---------
    if (items.length === 0) {
      const rx = new RegExp(escapeRegex(termino), "i");
      const query = {
        $or: [
          { title: rx },
          { description: rx },
          { nodeLabel: rx },
          { categoryName: rx },
          { categoryId: rx },
          // como el esquema es flexible, añadimos un comodín: NO recomendado para colecciones muy grandes,
          // pero útil si estás en fase inicial:
          // { anyStringField: rx }  <-- no se puede directamente, por eso mantenemos algunos campos probables
        ]
      };

      items = await Curso.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .lean();

      const totalRx = await Curso.countDocuments(query);

      return res.json({
        ok: true,
        source: "regex",
        page: pg,
        limit: lm,
        total: totalRx,
        items
      });
    }

    return res.json({
      ok: true,
      source: "text",
      page: pg,
      limit: lm,
      total: totalText,
      items
    });

  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ ok: false, error: "Error en el servidor", detalle: error.message });
  }
};

// Helper: sugerencias (títulos) con $text
export const sugerencias = async (req, res) => {
  try {
    const { termino } = req.body || {};
    if (!termino) return res.status(400).json({ ok:false, error:"Falta 'termino'" });

    const sugs = await Curso.aggregate([
      { $match: { $text: { $search: termino } } },
      { $project: { _id: 0, title: 1, score: { $meta: "textScore" } } },
      { $sort: { score: -1 } },
      { $limit: 5 }
    ]);

    res.json({ ok:true, items: sugs.map(s => s.title).filter(Boolean) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:"Error en sugerencias" });
  }
};

function escapeRegex(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
