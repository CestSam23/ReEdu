import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Escritorio.css";

// === TU DATA DE PRUEBA (igual que la que tenías) ===
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

  // ---- NUEVO: estado para el visor/modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [topicData, setTopicData] = useState(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // Layout del árbol (igual que el tuyo)
  const layout = useMemo(() => {
    const colGap = 220;
    const rowGap = 100;
    const startX = 260;
    const baseY  = 200;
    const nodes = [];
    const edges = [];

    category.nodes.forEach((label, i) => {
      let x = startX + i * colGap;
      if (i === 3) x -= 40;
      const off = i === 0 ? 0 : (i % 2 === 0 ? (i / 2) * -1 : Math.ceil(i / 2));
      const y = baseY + off * rowGap;

      nodes.push({ id: `n-${i}`, label, x, y, isRoot: i === 0 });
    });

    if (nodes[0] && nodes[1]) edges.push({ from: nodes[0], to: nodes[1] });
    if (nodes[1] && nodes[2]) edges.push({ from: nodes[1], to: nodes[2] });
    if (nodes[1] && nodes[3]) edges.push({ from: nodes[1], to: nodes[3] });
    for (let i = 4; i < nodes.length; i++) edges.push({ from: nodes[i - 1], to: nodes[i] });

    const width = Math.max(1100, startX + (category.nodes.length + 1) * colGap);
    const height = 680;

    return { nodes, edges, width, height };
  }, [category]);

  // Normalizador para que coincida con tu BD de ejemplo
  const normalizeTopic = (d, fallbackTitle) => {
    // d puede venir tal cual tu documento completo o sólo una lección
    const firstLesson = d?.lessons?.[0] ?? null;
    return {
      title: d?.title || firstLesson?.title || fallbackTitle || "Tema",
      description: d?.description || "",
      // recursos directos + (opcional) mapear videos/pdf adicionales
      resources: Array.isArray(d?.resources) ? d.resources : [],
      // contenido HTML (si existe)
      html: firstLesson?.content || d?.content || ""
    };
  };

  // ---- NUEVO: al hacer click, abrimos modal y cargamos el contenido
  const buscarContenido = async (terminoBusqueda) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/cursos/busqueda-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termino: terminoBusqueda })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la búsqueda');
      }

      // Procesar resultados
      const resultadosFormateados = data.map(curso => ({
        id: curso._id,
        titulo: curso.title,
        coincidencias: curso.matches.map(match => ({
          campo: match.campo,
          fragmento: match.fragmento
        }))
      }));

      setResultados(resultadosFormateados);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="desk2">
      {/* HEADER */}
      <div className="desk2-topbar">
        <Link to="/" className="desk2-home">Página de inicio</Link>
        <h1 className="desk2-title">{category.name}</h1>
      </div>

      {/* SIDEBAR */}
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
          <div className="tree2-nodes" style={{ width: layout.width, height: layout.height }}>
            {layout.nodes.map((n) => (
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

      {/* === NUEVO: MODAL DEL VISOR === */}
      <ViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        topic={topicData}
        loading={loadingTopic}
      />
    </div>
  );
}

function ResultadosBusqueda({ termino, resultados }) {
  return (
    <div className="resultados-busqueda">
      <h3>Resultados para "{termino}"</h3>
      
      {resultados.length === 0 ? (
        <p>No se encontraron coincidencias</p>
      ) : (
        <div className="resultados-container">
          {resultados.map((curso) => (
            <div key={curso.id} className="card-curso">
              <h4>{curso.titulo}</h4>
              
              <div className="coincidencias">
                {curso.coincidencias.map((match, i) => (
                  <div key={i} className="coincidencia">
                    <span className="campo">{match.campo}:</span>
                    <p 
                      dangerouslySetInnerHTML={{ 
                        __html: resaltarTermino(match.fragmento, termino) 
                      }} 
                    />
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => abrirCurso(curso.id)}
                className="btn-ver-curso"
              >
                Ver curso completo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper para resaltar texto
function resaltarTermino(texto, termino) {
  const regex = new RegExp(`(${termino})`, 'gi');
  return texto.replace(regex, '<mark>$1</mark>');
}

/* =======================
   Modal + ResourceViewer
   ======================= */

function ViewerModal({ open, onClose, topic, loading }) {
  // Cierra con ESC
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const resources = topic?.resources ?? [];
  const hasHtml = !!topic?.html;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{topic?.title || "Contenido"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="modal-loading">Cargando…</div>}

        {!loading && (
          <>
            {/* Tabs simples si hay varios recursos o HTML */}
            <TabbedViewer resources={resources} html={topic?.html} description={topic?.description} />
          </>
        )}
      </div>
    </div>
  );
}

function TabbedViewer({ resources, html, description }) {
  const tabs = [
    ...resources.map((r, i) => ({ key: `res-${i}`, label: labelForResource(r, i), type: "res", data: r })),
    ...(html ? [{ key: "html", label: "Lectura", type: "html", data: html }] : [])
  ];

  const [active, setActive] = useState(tabs[0]?.key);

  if (tabs.length === 0) {
    return (
      <div className="modal-empty">
        <p>No hay recursos para mostrar.</p>
        {description && <p className="modal-desc">{description}</p>}
      </div>
    );
  }

  const current = tabs.find(t => t.key === active) ?? tabs[0];

  return (
    <div className="tabs">
      <div className="tabs-bar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${t.key === active ? "is-active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tabs-body">
        {current.type === "res" && <ResourceViewer res={current.data} />}
        {current.type === "html" && <HtmlViewer html={current.data} />}
      </div>
    </div>
  );
}

function labelForResource(r, i) {
  if (r.label) return r.label;
  if (r.type === "pdf") return "PDF";
  if (r.type === "video") return "Video";
  if (r.type === "image") return "Imagen";
  return `Recurso ${i + 1}`;
}

function ResourceViewer({ res }) {
  if (!res) return null;

  // PDF
  if (res.type === "pdf" && res.url) {
    return (
      <div className="frame-wrap">
        <iframe
          className="frame"
          src={`${res.url}#toolbar=1&navpanes=0`}
          title="PDF"
          loading="lazy"
        />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir en pestaña
        </a>
      </div>
    );
  }

  // VIDEO (YouTube/Vimeo o MP4 directo)
  if (res.type === "video" && res.url) {
    const yt = toYouTubeEmbed(res.url);
    if (yt) {
      return (
        <div className="frame-wrap">
          <iframe
            className="frame"
            src={yt}
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
          <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
            Abrir en YouTube
          </a>
        </div>
      );
    }
    // MP4 u otros
    return (
      <div className="video-wrap">
        <video className="video" controls src={res.url} />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir descarga
        </a>
      </div>
    );
  }

  // IMAGEN
  if (res.type === "image" && res.url) {
    return (
      <div className="img-wrap">
        <img className="img" src={res.url} alt={res.alt || "Recurso"} />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir imagen
        </a>
      </div>
    );
  }

  // CUALQUIER OTRA COSA: intentar con iframe
  if (res.url) {
    return (
      <div className="frame-wrap">
        <iframe className="frame" src={res.url} title="Recurso" loading="lazy" />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir en pestaña
        </a>
      </div>
    );
  }

  return <div className="modal-empty">Recurso vacío.</div>;
}

function HtmlViewer({ html }) {
  const safe = html;
  return (
    <div className="html-wrap" dangerouslySetInnerHTML={{ __html: safe }} />
  );
}

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // links tipo /embed/ ya sirven, /shorts/:id -> convertir
      const parts = u.pathname.split("/");
      if (parts[1] === "shorts" && parts[2]) return `https://www.youtube.com/embed/${parts[2]}`;
      return url;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}
