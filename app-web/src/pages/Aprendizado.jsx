const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

export default function Aprendizado() {
  return (
    <>
      <div className="page-header">
        <h1 className="display">Aprendizado Contínuo</h1>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--mut)', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
          Log de diretrizes aprendidas e refino da IA.
        </p>
        <a className="btn btn-primary" href={PORTAL + '/aprendizado.html'} target="_blank" rel="noopener noreferrer">
          Abrir Aprendizado →
        </a>
      </div>
    </>
  )
}
