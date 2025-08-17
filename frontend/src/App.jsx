import { Routes, Route } from 'react-router-dom'

// Importa páginas (que vamos a crear ahora)
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Escritorio from './pages/Escritorio.jsx'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/escritorio" element={<Escritorio />} />
      
    </Routes>
  )
}

export default App