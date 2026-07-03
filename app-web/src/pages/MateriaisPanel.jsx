import { useState } from 'react'
import { generations, getBrandVoice, gerar } from '../lib/gh.js'

const PLATAFORMAS = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
]

export default function MateriaisPanel({ camp, onSalvar }) {
  const [aba, setAba] = useState('copy')
  const [infoExtra, setInfoExtra] = useState('')
  const [plataforma, setPlataforma] = useState('instagram')
  const [iaGerando, setIaGerando] = useState(false)
  const [resultadoCopy, setResultadoCopy] = useState('')
  const [resultadoDesc, setResultadoDesc] = useState('')
  const [erro, setErro] = useState('')

  const gens = generations()

  const contextoBrief = () => {
    const parts = []
    if (camp.brief?.produto_nome) parts.push(camp.brief.produto_nome)
    if (camp.geracao) parts.push('geração ' + (gens[camp.geracao]?.full || camp.geracao))
    if (camp.pilar) parts.push('pilar ' + camp.pilar)
    if (camp.tema) parts.push('tema ' + camp.tema)
    return parts.join(' · ') || 'nenhum contexto definido'
  }

  const gerarCopy = async () => {
    setIaGerando(true)
    setResultadoCopy('')
    setErro('')
    try {
      const brandVoice = getBrandVoice(camp.geracao, '', 'neutro')
      const genInfo = camp.geracao ? gens[camp.geracao] : null
      const genLabel = genInfo ? genInfo.full : 'Gamer geral'
      const prompt = `${brandVoice}

---

TAREFA: Use o branding book acima como base obrigatória de tom de voz e estrutura.

PÚBLICO-ALVO: ${genLabel}
Contexto do produto: ${camp.brief?.produto_nome || '—'}
Pilar: ${camp.pilar || '—'}
Tema: ${camp.tema || '—'}
Ângulo: ${camp.brief?.angulo || '—'}
Informação extra / gancho: ${infoExtra || '—'}

Crie 3 opções de copy para legenda/chamada de redes sociais seguindo a Fórmula de copy: gancho → jogo → diferencial → info comercial → CTA que pergunta algo.

Regras:
- Nome do jogo no início
- Título curto e forte (máx ~6 palavras)
- Legenda de 2 a 4 frases
- CTA final
- Emojis com moderação (0 a 3)
- Não repita o mesmo ângulo nas 3 variações
- Português do Brasil

Responda SOMENTE com JSON válido, sem texto fora dele:
{"variacoes":[{"titulo":"...","legenda":"...","cta":"...","hashtags":["..."]}]}`
      const resposta = await gerar(prompt)
      setResultadoCopy(resposta)
    } catch (e) {
      setErro('Erro ao gerar: ' + e.message)
    } finally {
      setIaGerando(false)
    }
  }

  const gerarDescricao = async () => {
    setIaGerando(true)
    setResultadoDesc('')
    setErro('')
    try {
      const brandVoice = getBrandVoice(camp.geracao, plataforma, 'neutro')
      const genInfo = camp.geracao ? gens[camp.geracao] : null
      const genLabel = genInfo ? genInfo.full : 'Gamer geral'
      const platLabel = PLATAFORMAS.find(p => p.id === plataforma)?.label || plataforma

      let platformRules = ''
      if (plataforma === 'youtube') {
        platformRules = 'Regras YouTube:\n- Descrição LONGA (200-500 palavras)\n- Parágrafo introdutório, análise, seção de links\n- Hashtags no final (5-10)\n- Fechar com "🔔 Inscreva-se no canal e ative o sininho!"'
      } else if (plataforma === 'tiktok') {
        platformRules = 'Regras TikTok:\n- Bloco 1: gancho forte\n- Bloco 2: contexto curto\n- Bloco 3: pergunta direta\n- Bloco 4: informação comercial + CTA\n- Bloco 5: 3-5 trending hashtags\n- Tom direto e conversational'
      } else {
        platformRules = 'Regras Instagram:\n- Descrição MÉDIA (100-250 palavras)\n- Storytelling com gancho emocional\n- Tom de comunidade e pertencimento\n- 5-10 hashtags segmentadas\n- CTA nos comentários'
      }

      const prompt = `${brandVoice}

---

TAREFA: Gere uma descrição padronizada e otimizada para ${platLabel}. Use o branding book como base.

PÚBLICO-ALVO: ${genLabel}
Plataforma: ${platLabel}
Produto: ${camp.brief?.produto_nome || '—'}
Contexto do Brief: ${camp.brief?.angulo || '—'}
Pilar: ${camp.pilar || '—'}
Tema: ${camp.tema || '—'}
Informação extra: ${infoExtra || '—'}

${platformRules}

Regras gerais:
- Respeite o contexto geracional (${genLabel})
- Português do Brasil

Responda SOMENTE com JSON válido:
{"texto":"descrição completa formatada para a plataforma","title":"título opcional"}`
      const resposta = await gerar(prompt)
      setResultadoDesc(resposta)
    } catch (e) {
      setErro('Erro ao gerar: ' + e.message)
    } finally {
      setIaGerando(false)
    }
  }

  const salvar = () => {
    const texto = aba === 'copy' ? resultadoCopy : resultadoDesc
    if (!texto) return
    const novoItem = {
      texto,
      informacao_extra: infoExtra.trim(),
      plataforma: aba === 'descricao' ? plataforma : null,
      gerado_em: new Date().toISOString(),
    }
    const materiaisAtuais = camp.materiais || {}
    if (aba === 'copy') {
      onSalvar({
        materiais: {
          ...materiaisAtuais,
          copys: [...(materiaisAtuais.copys || []), novoItem],
        }
      })
    } else {
      onSalvar({
        materiais: {
          ...materiaisAtuais,
          descricoes: [...(materiaisAtuais.descricoes || []), novoItem],
        }
      })
    }
  }

  const resultado = aba === 'copy' ? resultadoCopy : resultadoDesc

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Materiais — conteúdo por canal</h3>
      <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        Gere copys (legendas/chamadas) e descrições (YT/TikTok/IG) com o contexto do Brief.
      </p>

      <div className="alert" style={{ fontSize: 12, marginBottom: 20 }}>
        Contexto herdado do Brief: <b>{contextoBrief()}</b>
      </div>

      <div className="trilha" style={{ marginBottom: 20 }}>
        <div className={'step' + (aba === 'copy' ? ' active' : '')} onClick={() => setAba('copy')} style={{ cursor: 'pointer' }}>
          <span className="badge">01</span>
          <span><span className="lbl">Copy</span><span className="sub">legendas e chamadas</span></span>
        </div>
        <div className={'step' + (aba === 'descricao' ? ' active' : '')} onClick={() => setAba('descricao')} style={{ cursor: 'pointer' }}>
          <span className="badge">02</span>
          <span><span className="lbl">Descrição</span><span className="sub">YT · TikTok · IG</span></span>
        </div>
      </div>

      {aba === 'copy' ? (
        <>
          <Field label="Informação extra / gancho">
            <textarea value={infoExtra} onChange={e => setInfoExtra(e.target.value)}
              placeholder="Ex: Pré-venda com brinde exclusivo, nostalgia do jogo original..." />
          </Field>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={gerarCopy} disabled={iaGerando}>
              {iaGerando ? 'Gerando…' : '✨ Gerar Copy'}
            </button>
          </div>
        </>
      ) : (
        <>
          <Field label="Plataforma">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATAFORMAS.map(p => (
                <span key={p.id}
                  className={'tag ' + (plataforma === p.id ? 'tag-orange' : 'tag-gray')}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPlataforma(p.id)}>
                  {p.label}
                </span>
              ))}
            </div>
          </Field>
          <div style={{ marginTop: 16 }}>
            <Field label="Informação extra">
              <textarea value={infoExtra} onChange={e => setInfoExtra(e.target.value)}
                placeholder="Ex: Diferenciais do produto, preço, oferta especial..." />
            </Field>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={gerarDescricao} disabled={iaGerando}>
              {iaGerando ? 'Gerando…' : '✨ Gerar Descrição'}
            </button>
          </div>
        </>
      )}

      {erro && (
        <div className="alert" style={{ marginTop: 16, fontSize: 12, borderLeftColor: 'var(--red, #E23B2E)' }}>
          {erro}
        </div>
      )}

      {resultado && (
        <div className="alert" style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 12 }}>
          <strong>Resultado:</strong><br />{resultado}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={salvar} disabled={!resultado}>
          Salvar nos materiais e seguir →
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 10,
        letterSpacing: '.08em', color: 'var(--mut)', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
