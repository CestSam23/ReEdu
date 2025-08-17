import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import bgVideo from '../assets/hero.mp4' // tu video aquí
import './Home.css' // tu CSS específico para Home

export default function Home() {
  const faqRef = useRef(null)
  const [activeTab, setActiveTab] = useState('populares')

  // Ejemplo de datos de cursos
  const populares = [
    { titulo: 'React Básico', descripcion: 'Aprende los fundamentos de React.' },
    { titulo: 'Node.js Express', descripcion: 'Desarrolla APIs con Node y Express.' }
  ]
  const recientes = [
    { titulo: 'Python para Data Science', descripcion: 'Introducción a análisis de datos.' },
    { titulo: 'Docker Essentials', descripcion: 'Conteneriza tus aplicaciones.' }
  ]

  const scrollToFAQ = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        {/* Botones principales */}
        <div className="home-buttons">
          <Link className="btn" to="/login">Login</Link>
          <Link className="btn" to="/registro">Registro</Link>
          <button className="btn btn-ghost" onClick={scrollToFAQ}>
            Preguntas frecuentes
          </button>
        </div>

        {/* Slogan grande */}
        <h2 className="home-slogan">[Slogan aún por definir]</h2>
      </main>

      {/* Sección de cursos con pestañas y carrusel */}
      <section className="home-courses">
        {/* Títulos con pestañas */}
        <div className="courses-tabs">
          <button
            className={`tab${activeTab === 'populares' ? ' active' : ''}`}
            onClick={() => setActiveTab('populares')}
          >
            Cursos Populares
          </button>
          <button
            className={`tab${activeTab === 'recientes' ? ' active' : ''}`}
            onClick={() => setActiveTab('recientes')}
          >
            Cursos Recientemente Agregados
          </button>
        </div>

        {/* Carrusel */}
        <div className="courses-carousel">
          {activeTab === 'populares' &&
            populares.map((curso, index) => (
              <div key={index} className="course-card">
                <div className="course-image">Imagen</div>
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
              </div>
            ))
          }

          {activeTab === 'recientes' &&
            recientes.map((curso, index) => (
              <div key={index} className="course-card">
                <div className="course-image">Imagen</div>
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
              </div>
            ))
          }
        </div>
      </section>

      {/* Sección de Preguntas frecuentes al final */}
      <section className="home-faq" ref={faqRef}>
        <h2>Preguntas frecuentes</h2>
        <details>
          <summary>¿Cómo creo una cuenta?</summary>
          <p>Haz clic en “Registro” y completa el formulario.</p>
        </details>
        <details>
          <summary>Olvidé mi contraseña</summary>
          <p>En la página de login, haz clic en “Olvidé mi contraseña”.</p>
        </details>
      </section>
    </div>
  )
}
