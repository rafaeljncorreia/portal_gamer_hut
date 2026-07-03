const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

export default function Studio() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Gamer Hut · Criativo</span>
          <h1 className="display" style={{ fontSize: 34, margin: '14px 0 0' }}>Creative Studio</h1>
        </div>
      </div>
      <div style={{ width: '100%', height: 'calc(100vh - 200px)', border: '1px solid var(--lineSoft)', borderRadius: 12, overflow: 'hidden' }}>
        <iframe src={PORTAL + '/studio.html'} style={{ width: '100%', height: '100%', border: 'none' }} title="Creative Studio" />
      </div>
    </>
  )
}
