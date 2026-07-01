export default function Placeholder({ name, eta }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div className="pixel" style={{ fontSize:12, color:'var(--orange)', marginBottom:20 }}>
        EM BREVE
      </div>
      <h1 className="display" style={{ fontSize:32, margin:'0 0 12px' }}>{name}</h1>
      <p style={{ color:'var(--mut)', fontSize:15 }}>
        Módulo previsto para a {eta}.
      </p>
    </div>
  )
}
