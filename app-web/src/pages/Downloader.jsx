const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

export default function Downloader() {
  return (
    <>
      <div className="page-header">
        <h1 className="display">Media Downloader</h1>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--mut)', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
          Esta ferramenta está disponível no portal clássico.
        </p>
        <a className="btn btn-primary" href={PORTAL + '/downloader.html'} target="_blank" rel="noopener noreferrer">
          Abrir Downloader →
        </a>
      </div>
    </>
  )
}
