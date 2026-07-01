import { Routes, Route, NavLink } from 'react-router-dom'
import Catalogo from './pages/Catalogo.jsx'
import Marca from './pages/Marca.jsx'
import Placeholder from './pages/Placeholder.jsx'

const API = import.meta.env.VITE_API_URL || ''

const links = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/marca',    label: 'Marca' },
  { to: '/radar',    label: 'Radar' },
  { to: '/plano',    label: 'Plano' },
  { to: '/gerar',    label: 'Gerar' },
]

function App() {
  return (
    <>
      <nav className="nav">
        <div className="brand">
          <span className="display" style={{ color:'var(--orange)', fontSize:18 }}>GH</span>
          <div className="tag">
            <div className="t1">Plataforma de Gestão</div>
            <div className="t2">Portal Gamer Hut</div>
          </div>
        </div>
        <div className="links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="wrap">
        <Routes>
          <Route path="/" element={<Catalogo api={API} />} />
          <Route path="/catalogo" element={<Catalogo api={API} />} />
          <Route path="/marca" element={<Marca api={API} />} />
          <Route path="/radar" element={<Placeholder name="Radar de Lançamentos" eta="Fase 3" />} />
          <Route path="/plano" element={<Placeholder name="Planejamento Editorial" eta="Fase 4" />} />
          <Route path="/gerar" element={<Placeholder name="Geração de Conteúdo" eta="Fase 2" />} />
        </Routes>
      </div>

      <footer className="foot">
        <span className="pixel" style={{ fontSize:10, color:'var(--orange)' }}>GAMER HUT</span>
        <div className="fr">
          <span className="b">Plataforma de Gestão · Fase 1</span>
        </div>
      </footer>
    </>
  )
}

export default App
