const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

export default function Review() {
  return (
    <>
      <div className="page-header">
        <h1 className="display">Review de Criativos</h1>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--mut)', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
          Revise e aprove peças criativas antes de publicar.
        </p>
        <a className="btn btn-primary" href={PORTAL + '/review.html'} target="_blank" rel="noopener noreferrer">
          Abrir Review →
        </a>
      </div>
    </>
  )
}
