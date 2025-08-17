import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Escritorio.css";

const CATEGORIES = [
  {
    id: "cultura-digital-1",
    name: "Cultura digital 1",
    nodes: [
      "Primeros pasos",
      "Herramientas indispensables",
      "Buenas prácticas",
      "Ofimática y nubes",
      "Seguridad y ciudadanía digital",
      "Pensamiento computacional"
    ]
  },
  {
    id: "ingles-1",
    name: "Inglés 1",
    nodes: [
      "Primeros pasos",
      "Saludos y presentaciones",
      "Verbo To Be",
      "Preguntas WH",
      "Vocabulario escolar",
      "Rutinas diarias"
    ]
  },
  {
    id: "pensamiento-matematico-1",
    name: "Pensamiento matemático 1",
    nodes: [
      "Primeros pasos",
      "Aritmética básica",
      "Álgebra elemental",
      "Proporciones y porcentajes",
      "Ecuaciones lineales",
      "Problemas aplicados"
    ]
  },
  {
    id: "filosofia-humanidades-1",
    name: "Pensamiento filosófico y humanidades 1",
    nodes: [
      "Primeros pasos",
      "¿Qué es filosofía?",
      "Ética cotidiana",
      "Argumentación básica",
      "Lógica informal",
      "Lectura crítica"
    ]
  },
  {
    id: "ciencias-sociales-1",
    name: "Ciencias sociales 1",
    nodes: [
      "Primeros pasos",
      "Mapas y geografía",
      "Organización social",
      "Economía básica",
      "Cultura y diversidad",
      "Ciudadanía"
    ]
  },
  {
    id: "ciencias-naturales-1",
    name: "Ciencias naturales 1",
    nodes: [
      "Primeros pasos",
      "Método científico",
      "Materia y energía",
      "Seres vivos",
      "Ecosistemas",
      "Salud y ambiente"
    ]
  }
];

const slug = (s) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function Escritorio() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === active) ?? CATEGORIES[0],
    [active]
  );

  // Layout: nodos en columnas, filas alternadas para aire
  const layout = useMemo(() => {
    const colGap = 220;     // separación horizontal
    const rowGap = 100;     // separación vertical
    const startX = 260;     // arranque (después del sidebar)
    const baseY  = 200;     // línea base
    const nodes = [];
    const edges = [];

    category.nodes.forEach((label, i) => {
      let x = startX + i * colGap;
      // Mueve el nodo 3 (índice 3) 40px a la izquierda
      if (i === 3) x -= 40;
      // alterna filas: 0, -1, +1, -2, +2, ...
      const off = i === 0 ? 0 : (i % 2 === 0 ? (i / 2) * -1 : Math.ceil(i / 2));
      const y = baseY + off * rowGap;

      nodes.push({ id: `n-${i}`, label, x, y, isRoot: i === 0 });
    });

    // --- Conexiones rectas SEGÚN TU REGLA:
    // n0 -> n1
    if (nodes[0] && nodes[1]) edges.push({ from: nodes[0], to: nodes[1] });
    // n1 -> n2 y n1 -> n3
    if (nodes[1] && nodes[2]) edges.push({ from: nodes[1], to: nodes[2] });
    if (nodes[1] && nodes[3]) edges.push({ from: nodes[1], to: nodes[3] });
    // del n4 en adelante, cadena desde el previo inmediato
    for (let i = 4; i < nodes.length; i++) {
      edges.push({ from: nodes[i - 1], to: nodes[i] });
    }

    // Tamaño del lienzo
    const width = Math.max(1100, startX + (category.nodes.length + 1) * colGap);
    const height = 680;

    return { nodes, edges, width, height };
  }, [category]);

  const openTopic = (label) => {
    window.open(`/curso/${slug(category.name)}-${slug(label)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="desk2">
      {/* HEADER SUPERIOR */}
      <div className="desk2-topbar">
        <Link to="/" className="desk2-home">Página de inicio</Link>
        <h1 className="desk2-title">{category.name}</h1>
      </div>

      {/* SIDEBAR (debajo del header) */}
      <aside className="desk2-sidebar">
        <h4 className="desk2-subtitle">Categorías</h4>
        <ul className="desk2-cats">
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                className={`desk2-chip ${cat.id === active ? "active" : ""}`}
                onClick={() => setActive(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* CANVAS ÁRBOL */}
      <section className="desk2-main">
        <div className="tree2">
          {/* LÍNEAS RECTAS ELIMINADAS */}
          {/* <svg
            className="tree2-svg"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            preserveAspectRatio="xMidYMin slice"
          >
            {layout.edges.map((e, idx) => (
              <line
                key={idx}
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                className="tree2-edge"
              />
            ))}
          </svg> */}

          {/* NODOS */}
          <div className="tree2-nodes" style={{ width: layout.width, height: layout.height }}>
            {layout.nodes.map((n, i) => (
              <button
                key={n.id}
                className={`t2-node ${n.isRoot ? "root" : ""}`}
                style={{ left: n.x, top: n.y }}
                onClick={() => openTopic(n.label)}
                title={n.label}
              >
                <span className="t2-title">{n.label}</span>
                {!n.isRoot && <span className="t2-dots">●●●◻︎</span>}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
