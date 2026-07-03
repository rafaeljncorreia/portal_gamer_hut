import { Routes, Route, NavLink } from 'react-router-dom'
import Campanhas from './pages/Campanhas.jsx'
import Campanha from './pages/Campanha.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Marca from './pages/Marca.jsx'
import Calendario from './pages/Calendario.jsx'
import Studio from './pages/Studio.jsx'
import Downloader from './pages/Downloader.jsx'
import Review from './pages/Review.jsx'
import Aprendizado from './pages/Aprendizado.jsx'

const links = [
  { to: '/',         label: 'Campanhas', end: true },
  { to: '/marca',    label: 'Marca' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/ferramentas/calendario', label: 'Calendário' },
]

function App() {
  return (
    <>
      <nav className="nav">
        <NavLink to="/" className="brand">
          <span className="display" style={{ color: 'var(--orange)', fontSize: 18 }}>GH</span>
          <div className="tag">
            <div className="t1">Gamer Hut</div>
            <div className="t2">PLATAFORMA DE GESTÃO</div>
          </div>
        </NavLink>
        <div className="links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="wrap">
        <Routes>
          <Route path="/" element={<Campanhas />} />
          <Route path="/campanha/:id" element={<Campanha />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/ferramentas/calendario" element={<Calendario />} />
          <Route path="/ferramentas/studio" element={<Studio />} />
          <Route path="/ferramentas/downloader" element={<Downloader />} />
          <Route path="/ferramentas/review" element={<Review />} />
          <Route path="/ferramentas/aprendizado" element={<Aprendizado />} />
          <Route path="*" element={<Campanhas />} />
        </Routes>
      </div>

      <footer className="foot">
        <span className="pixel" style={{ fontSize: 10, color: 'var(--orange)' }}>GAMER HUT</span>
        <div className="fr">
          <span className="b">Plataforma de Gestão · campaign-centric</span>
        </div>
      </footer>
    </>
  )
}

export default App
