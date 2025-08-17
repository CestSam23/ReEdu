import { useState } from "react";
import "./Escritorio.css";

// === Ajusta la indentación del árbol ===
// 0  -> sin indentación
// 6  -> indentación pequeña (puedes subir/bajar este número)
const INDENT_PX = 0;

const SKILLS_TREE = {
  "Lengua y Comunicación I": {
    "Inglés I": {
      "Pensamiento Matemático I": {
        "Cultura Digital I": {
          "Ciencias Naturales I": {
            "Pensamiento Filosófico y Humanidades I": {
              "Ciencias Sociales I": {
                "Cultura Digital II": {
                  "Lengua y Comunicación II": {
                    "Inglés II": {
                      "Pensamiento Matemático II": {
                        "Ciencias Sociales II": {
                          "Ciencias Naturales II": {
                            "Lengua y Comunicación III": {
                              "Inglés III": {
                                "Pensamiento Matemático III": {
                                  "Ciencias Naturales III": {
                                    "Pensamiento Filosófico y Humanidades II": {}
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default function Escritorio() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const rootName = Object.keys(SKILLS_TREE)[0];
  const [showSkillsTree, setShowSkillsTree] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState([rootName]); // raíz abierta

  const toggleNode = (nodePath) => {
    setExpandedNodes((prev) =>
      prev.includes(nodePath)
        ? prev.filter((p) => p !== nodePath && !p.startsWith(nodePath + "."))
        : [...prev, nodePath]
    );
  };

  // Árbol VERTICAL con indentación configurable
  const renderVertical = (tree, level = 0, path = "") => {
    return Object.entries(tree).map(([name, children]) => {
      const nodePath = path ? `${path}.${name}` : name;
      const hasChildren = children && Object.keys(children).length > 0;
      const isExpanded = expandedNodes.includes(nodePath);

      return (
        <div
          key={nodePath}
          className="v-branch"
          style={{ marginLeft: level === 0 ? 0 : level * INDENT_PX }}
        >
          <div
            className={`v-node ${level === 0 ? "main" : "sub"}${
              hasChildren ? " has-children" : ""
            }${isExpanded ? " expanded" : ""}`}
            onClick={() => hasChildren && toggleNode(nodePath)}
          >
            {hasChildren && (
              <span className="v-toggle" aria-hidden>
                {isExpanded ? "▾" : "▸"}
              </span>
            )}
            <span className="v-label">{name}</span>
          </div>

          {isExpanded && hasChildren && (
            <div className="v-children">{renderVertical(children, level + 1, nodePath)}</div>
          )}
        </div>
      );
    });
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <main className="page simple" style={{ padding: 24 }}>
      <section className="stack">
        <h1 className="question">Escritorio</h1>
        <p>Bienvenido{user?.name ? `, ${user.name}` : ""} 👋</p>

        <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(user, null, 2)}
        </pre>

        <button className="btn" onClick={() => setShowSkillsTree((s) => !s)}>
          {showSkillsTree ? "Ocultar" : "Ver"} mapa de habilidades
        </button>

        {showSkillsTree && (
          <div className={`home-skills ${INDENT_PX === 0 ? "flat" : "compact"}`}>
            <div className="skills-title">Mapa de habilidades</div>
            <div className="skills-description">Haz clic en un nodo para expandir/colapsar.</div>

            <div className="v-tree">
              {renderVertical(SKILLS_TREE)}
            </div>
          </div>
        )}

        <button className="btn" onClick={logout}>Cerrar sesión</button>
      </section>
    </main>
  );
}
