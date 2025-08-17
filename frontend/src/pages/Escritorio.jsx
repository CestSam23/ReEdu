import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Escritorio.css";

// === DATA DE PRUEBA ===
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

  // Viewer existente
  const [viewerOpen, setViewerOpen] = useState(false);
  const [topicData, setTopicData] = useState(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // Chat Gemini
  const [chatOpen, setChatOpen] = useState(false);

  // Layout del árbol
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

  // Normalizador BD
  const normalizeTopic = (d, fallbackTitle) => {
    const firstLesson = d?.lessons?.[0] ?? null;
    return {
      title: d?.title || firstLesson?.title || fallbackTitle || "Tema",
      description: d?.description || "",
      resources: Array.isArray(d?.resources) ? d.resources : [],
      html: firstLesson?.content || d?.content || ""
    };
  };

  // Click en nodo => abrir modal de contenido
  const openTopic = async (label) => {
    setViewerOpen(true);
    setLoadingTopic(true);

    try {
      const res = await fetch(
        `/api/topics?category=${encodeURIComponent(active)}&topic=${encodeURIComponent(slug(label))}`
      );

      if (!res.ok) throw new Error("No OK");
      const data = await res.json();
      setTopicData(normalizeTopic(data, label));
    } catch (e) {
      // Fallback local mientras no hay backend
      const demoFromDB = {
        title: "Cultura Digital I – Uso crítico de tecnologías. I2 C2",
        description: "Buenas prácticas de seguridad y servicios digitales.",
        resources: [
          { type: "pdf", url: "https://www.imss.gob.mx/sites/all/statics/pdf/guarderias/ninos-tecnologia.pdf" }
        ],
        lessons: [
          {
            title: "Seguridad y servicios digitales",
            content: "<h1>Seguridad básica</h1><p>Usa contraseñas robustas y comprende servicios digitales como el correo electrónico.</p>"
          }
        ]
      };
      setTopicData(normalizeTopic(demoFromDB, label));
      console.error("[openTopic] fallback demo:", e);
    } finally {
      setLoadingTopic(false);
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

      {/* MODAL DE CONTENIDO */}
      <ViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        topic={topicData}
        loading={loadingTopic}
      />

      {/* FAB GEMINI */}
      <button
        className="gemini-fab"
        aria-label="Abrir asistente"
        onClick={() => setChatOpen(true)}
      >
        <GeminiIcon />
      </button>

      {/* MODAL CHAT GEMINI */}
      <GeminiChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

/* =======================
   Modal + ResourceViewer
   ======================= */
function ViewerModal({ open, onClose, topic, loading }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const resources = topic?.resources ?? [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{topic?.title || "Contenido"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="modal-loading">Cargando…</div>}

        {!loading && (
          <TabbedViewer resources={resources} html={topic?.html} description={topic?.description} />
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

  if (res.type === "pdf" && res.url) {
    return (
      <div className="frame-wrap">
        <iframe className="frame" src={`${res.url}#toolbar=1&navpanes=0`} title="PDF" loading="lazy" />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir en pestaña
        </a>
      </div>
    );
  }

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
    return (
      <div className="video-wrap">
        <video className="video" controls src={res.url} />
        <a className="open-link" href={res.url} target="_blank" rel="noopener noreferrer">
          Abrir descarga
        </a>
      </div>
    );
  }

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
  const safe = html; // Sanitiza con DOMPurify en prod
  return <div className="html-wrap" dangerouslySetInnerHTML={{ __html: safe }} />;
}

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
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

/* =======================
   Modal de chat (Gemini)
   ======================= */
function GeminiChatModal({ open, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', text:string}
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!open) return;

    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    setTimeout(() => inputRef.current?.focus(), 0);

    // Carga el intro personalizado  cada que se abre
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // quizá redirigir a login

        const res = await fetch(`${API_URL}/api/gemini/intro`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) {
          setMessages([{ role: 'assistant', text: data.intro }]);
        } else {
          // mensaje corto
          setMessages([{ role: 'assistant', text: "Hola, soy tu asistente. Puedo recomendarte qué estudiar según tus resultados cuando tenga acceso a tu información." }]);
        }
      } catch (e) {
        console.error(e);
        setMessages([{ role: 'assistant', text: "No pude cargar tu resumen personalizado, pero puedo ayudarte con tus dudas." }]);
      }
    })();

    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (!open) return null;

  const handleSend = async () => {
    const p = prompt.trim();
    if (!p || sending) return;
    setMessages((m) => [...m, { role: "user", text: p }]);
    setPrompt("");
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/gemini/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: p, history: messages })
      });
      const data = await res.json().catch(() => ({}));
      const text = data?.reply || "(sin respuesta)";
      setMessages((m) => [...m, { role: "assistant", text }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "No pude contactar al asistente. Intenta de nuevo." }
      ]);
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card chat" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="chat-title">
            <GeminiIcon />
            <span>Asistente Gemini</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 && (
            <div className="chat-placeholder">
              Escribe una pregunta para comenzar.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === "user" ? "user" : "assistant"}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-msg assistant">
              <div className="bubble bubble-loading">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu prompt… (Enter para enviar, Shift+Enter para salto de línea)"
            rows={2}
          />
          <button type="submit" disabled={sending || !prompt.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}


function GeminiIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7CF6F6"/>
          <stop offset="50%" stopColor="#6C6CFF"/>
          <stop offset="100%" stopColor="#A855F7"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#g1)" />
      <path d="M20 32c8-2 16-2 24 0M24 22c6 0 10 4 16 4M24 42c6 0 10-4 16-4"
            stroke="rgba(0,0,0,.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
