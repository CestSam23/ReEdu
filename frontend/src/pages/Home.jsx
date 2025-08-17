import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import bgVideo from '../assets/hero.mp4'
import './Home.css'

export default function Home() {
  const faqRef = useRef(null)
  const [activeTab, setActiveTab] = useState('populares')
  const carouselRef = useRef(null)
  const [showSkillsTree, setShowSkillsTree] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState([])

  // Datos del árbol de habilidades
  const skillsTree = {
    'Físico Matemáticas': {
      expanded: false,
      children: {
        'Matemáticas Avanzadas': {
          expanded: false,
          children: {
            'Cálculo Diferencial': {},
            'Álgebra Lineal': {}
          }
        },
        'Física': {
          expanded: false,
          children: {
            'Mecánica Clásica': {},
            'Electromagnetismo': {}
          }
        }
      }
    },
    'Económico Administrativas': {
      expanded: false,
      children: {
        'Administración': {
          expanded: false,
          children: {
            'Recursos Humanos': {},
            'Finanzas Corporativas': {}
          }
        },
        'Economía': {
          expanded: false,
          children: {
            'Microeconomía': {},
            'Macroeconomía': {}
          }
        }
      }
    },
    'Químico Biológicas': {
      expanded: false,
      children: {
        'Biología': {
          expanded: false,
          children: {
            'Genética': {},
            'Bioquímica': {}
          }
        },
        'Química': {
          expanded: false,
          children: {
            'Química Orgánica': {},
            'Química Analítica': {}
          }
        }
      }
    },
    'Humanidades': {
      expanded: false,
      children: {
        'Filosofía': {
          expanded: false,
          children: {
            'Ética': {},
            'Lógica': {}
          }
        },
        'Literatura': {
          expanded: false,
          children: {
            'Literatura Universal': {},
            'Redacción': {}
          }
        }
      }
    },
    'Ciencias de la Salud': {
      expanded: false,
      children: {
        'Medicina': {
          expanded: false,
          children: {
            'Anatomía': {},
            'Farmacología': {}
          }
        },
        'Nutrición': {
          expanded: false,
          children: {
            'Dietética': {},
            'Bioquímica Nutricional': {}
          }
        }
      }
    }
  }

  // Alternar expansión de un nodo
  const toggleNode = (nodePath) => {
    setExpandedNodes(prev => {
      if (prev.includes(nodePath)) {
        return prev.filter(path => !path.startsWith(nodePath))
      } else {
        return [...prev, nodePath]
      }
    })
  }

  // Renderizar árbol recursivamente
  const renderTree = (treeData, level = 0, path = '') => {
    return Object.entries(treeData).map(([name, node]) => {
      const nodePath = path ? `${path}.${name}` : name
      const isExpanded = expandedNodes.includes(nodePath)
      const hasChildren = Object.keys(node.children || {}).length > 0

      return (
        <div key={nodePath} className="tree-level">
          <div 
            className={`tree-node ${level === 0 ? 'main' : 'sub'}${hasChildren ? ' has-children' : ''}${isExpanded ? ' expanded' : ''}`}
            onClick={() => hasChildren && toggleNode(nodePath)}
          >
            {level > 0 && <div className="tree-connector"></div>}
            {name}
          </div>
          {isExpanded && hasChildren && (
            <div className="skills-tree">
              {renderTree(node.children, level + 1, nodePath)}
            </div>
          )}
        </div>
      )
    })
  }

  // Carrusel 
  const populares = [
    { titulo: 'Celula y evolución celular', descripcion: 'Procariotas, eucariotas, transporte y división celular.' },
    { titulo: 'Genética y Herencia', descripcion: 'Conceptos de genética y leyes de Mendel.' },
    { titulo: 'Identidades trigonométricas', descripcion: 'Básicas, suma y resta, múltiplos de ángulo.' },
    { titulo: 'Energía y electricidad', descripcion: 'Energía mecánica y conceptos básicos de electricidad.' },
    {titulo: 'Estructura atómica y tabla periódica', descripcion: 'Partículas subatómicas, configuración electrónica y propiedades.' },
  ]
  const recientes = [
    { titulo: 'Python para Data Science', descripcion: 'Introducción a análisis de datos.' },
    { titulo: 'Docker Essentials', descripcion: 'Conteneriza tus aplicaciones.' },
    { titulo: 'Machine Learning 101', descripcion: 'Fundamentos de Machine Learning.' },
    { titulo: 'Introducción a la IA', descripcion: 'Conceptos básicos de Inteligencia Artificial.' }
  ]

  const scrollToFAQ = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return
    const width = carouselRef.current.offsetWidth
    carouselRef.current.scrollBy({
      left: direction * width * 0.5,
      behavior: 'smooth'
    })
  }

  return (
    <div className="home-container">
      {/* Video de fondo */}
      <video className="home-video" src={bgVideo} autoPlay muted loop playsInline />

      {/* Overlay para mejorar contraste */}
      <div className="home-overlay" />

      {/* Contenido principal */}
      <header className="home-header">
        <h1>Pagina de Inicio</h1>
      </header>

      <main className="home-content">
        
        <div className="home-buttons">
          <Link className="btn" to="/login">Login</Link>
          <Link className="btn" to="/registro">Registro</Link>
          <button className="btn btn-ghost" onClick={scrollToFAQ}>
            Preguntas frecuentes
          </button>
        </div>

        
        <h2 className="home-slogan">Reducation for all</h2>
      </main>

      {/* Sección de cursos con pestañas y carrusel */}
      <section className="home-courses">
        
        <div className="courses-tabs">
          <button
            className={`tab ${activeTab === 'populares' ? 'active' : ''}`}
            onClick={() => setActiveTab('populares')}
          >
            Cursos Populares
          </button>
          <button
            className={`tab ${activeTab === 'recientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recientes')}
          >
            Cursos Recientemente Agregados
          </button>
        </div>

        {/* Contenedor relativo para flechas */}
        <div className="carousel-wrapper">
          <button className="carousel-arrow left" onClick={() => scrollCarousel(-1)}>&lt;</button>
          <div className="courses-carousel" ref={carouselRef}>
            {activeTab === 'populares' &&
              populares.map((curso, index) => (
                <div key={index} className="course-card">
                  <div className="course-image">Registrate para más información</div>
                  <h3>{curso.titulo}</h3>
                  <p>{curso.descripcion}</p>
                </div>
              ))
            }

            {activeTab === 'recientes' &&
              recientes.map((curso, index) => (
                <div key={index} className="course-card">
                  <div className="course-image">Registrate para más información</div>
                  <h3>{curso.titulo}</h3>
                  <p>{curso.descripcion}</p>
                </div>
              ))
            }
          </div>
          <button className="carousel-arrow right" onClick={() => scrollCarousel(1)}>&gt;</button>
        </div>
      </section>

      {/* Nueva sección del árbol de habilidades */}
      <section className="home-skills">
        <div className="skills-title">Nuestro árbol de habilidades</div>
        <p className="skills-description">
          Explora nuestro mapa completo de habilidades organizadas en un árbol de aprendizaje. 
          Cada rama representa un área de conocimiento y te muestra el camino recomendado para dominarla.
        </p>
        <button className="skills-toggle" onClick={() => setShowSkillsTree(!showSkillsTree)}>
          {showSkillsTree ? 'Ocultar árbol' : 'Mostrar árbol de habilidades'}
        </button>
        
        {showSkillsTree && (
          <div className="skills-tree">
            {renderTree(skillsTree)}
          </div>
        )}
      </section>

      {/* Sección de Preguntas frecuentes al final */}
      <section className="home-faq" ref={faqRef}>
        <h2>Preguntas frecuentes</h2>
        <details>
          <summary>¿Cómo creo una cuenta?</summary>
          <p>Haz clic en "Registro" y completa el formulario.</p>
        </details>
        <details>
          <summary>Olvidé mi contraseña</summary>
          <p>En la página de login, haz clic en "Olvidé mi contraseña".</p>
        </details>
        <details>
          <summary>¿Cómo inscribirme en un curso?</summary>
          <p>Navega a la página del curso y haz clic en "Inscribirse".</p>
        </details>
      </section>
    </div>
  )
}