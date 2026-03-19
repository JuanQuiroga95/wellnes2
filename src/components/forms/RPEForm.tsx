'use client'
import { useState } from 'react'
import ScaleInput from '@/components/ui/ScaleInput'
const DESC = {0:'Reposo total',1:'Muy leve',2:'Leve',3:'Moderado',4:'Un poco duro',5:'Duro',6:'Duro+',7:'Muy duro',8:'Muy duro+',9:'Máximo',10:'Esfuerzo absoluto'}
const TIPOS = [{value:'EQUIPO',label:'Equipo — Sesión completa'},{value:'PARCIAL',label:'Equipo — Sesión parcial'},{value:'READAPTACION',label:'Readaptación'}]
export default function RPEForm({ jugadorId, onSuccess }) {
  const [rpe, setRpe] = useState(null)
  const [dur, setDur] = useState('')
  const [tipo, setTipo] = useState('EQUIPO')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const carga = rpe!==null && parseInt(dur)>0 ? rpe*parseInt(dur) : null
  const canSubmit = rpe!==null && parseInt(dur)>0
  async function submit(e) {
    e.preventDefault(); if (!canSubmit) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/logs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ jugador_id:jugadorId, rpe, duracion_min:parseInt(dur), tipo_sesion:tipo }) })
      if (!res.ok) { const d=await res.json(); setError(d.error||'Error'); return }
      setDone(true); setTimeout(()=>{ setDone(false); onSuccess() }, 1600)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }
  if (done) return (
    <div style={{ textAlign:'center', padding:'48px 0' }} className="anim-up">
      <div style={{ width:64, height:64, background:'rgba(200,241,53,.1)', border:'2px solid var(--lime)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>✓</div>
      <p style={{ color:'var(--lime)', fontWeight:600, fontSize:16 }}>Carga registrada</p>
    </div>
  )
  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Tipo de sesión</label>
        <select className="wp-input" value={tipo} onChange={e=>setTipo(e.target.value)} style={{ appearance:'none', cursor:'pointer' }}>
          {TIPOS.map(t=><option key={t.value} value={t.value} style={{ background:'var(--ink2)' }}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
          RPE — Escala de Borg (0–10) {rpe!==null && <span style={{ color:'var(--lime)', fontWeight:400, textTransform:'none', letterSpacing:'normal', marginLeft:8 }}>{DESC[rpe]}</span>}
        </label>
        <ScaleInput id="rpe" value={rpe} onChange={setRpe} min={0} max={10} lowLabel="Reposo total" highLabel="Máximo absoluto" isRpe={true} />
      </div>
      <div>
        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Duración (minutos)</label>
        <input className="wp-input" type="number" min="1" max="300" value={dur} onChange={e=>setDur(e.target.value)} placeholder="ej: 90" />
      </div>
      {carga!==null && (
        <div style={{ textAlign:'center', padding:20, borderRadius:14, background:'rgba(200,241,53,.06)', border:'1px solid rgba(200,241,53,.2)' }}>
          <div className="display" style={{ fontSize:72, color:'var(--lime)', lineHeight:1 }}>{carga.toLocaleString()}</div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--silver)', marginTop:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Unidades Arbitrarias (UA)</div>
          <div style={{ fontSize:12, color:'var(--fog)', marginTop:4 }}>RPE {rpe} × {dur} min = {carga} UA</div>
        </div>
      )}
      {error && <p style={{ fontSize:12, color:'#f87171' }}>{error}</p>}
      <button type="submit" className="btn-lime" disabled={!canSubmit||loading} style={{ width:'100%', padding:14, fontSize:14 }}>
        {loading ? 'REGISTRANDO...' : 'REGISTRAR CARGA →'}
      </button>
      <p style={{ textAlign:'center', fontSize:11, color:'var(--silver)' }}>Completar 15–30 min después de la sesión</p>
    </form>
  )
}
