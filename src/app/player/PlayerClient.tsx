'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/ui/Topbar'
import WellnessForm from '@/components/forms/WellnessForm'
import RPEForm from '@/components/forms/RPEForm'
import WellnessTrend from '@/components/charts/WellnessTrend'

const TABS = [{id:'dashboard',label:'Mi Estado'},{id:'wellness',label:'Wellness Pre-Entreno'},{id:'rpe',label:'Registrar Carga'},{id:'config',label:'⚙️ Mi Perfil'}]
const WK = ['fatiga','calidad_sueno','dolor_muscular','nivel_estres','estado_animo']
const WL = ['Fatiga','Sueño','Dolor','Estrés','Ánimo']
const WC = ['#c8f135','#22c55e','#eab308','#f97316','#ef4444']
const s = (v) => v==null?'—':String(v)
const n = (v) => Number(v)||0

export default function PlayerClient({ session, jugador, jugadorId, acwr, acwrHistory, recentLogs, recentWellness, todayWellness, today }) {
  const [tab, setTab] = useState('dashboard')
  const router = useRouter()
  const lastW = recentWellness[0]

  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)' }}>
      <Topbar nombre={session.nombre} rol="jugador" tabs={TABS} activeTab={tab} onTabChange={setTab} />
      <main style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>

        {tab==='dashboard' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Status strip */}
            <div className="anim-up" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:140, background: todayWellness?'rgba(200,241,53,.08)':'rgba(239,68,68,.08)', border:`1px solid ${todayWellness?'rgba(200,241,53,.25)':'rgba(239,68,68,.25)'}`, borderRadius:12, padding:'12px 16px', cursor: todayWellness?'default':'pointer' }} onClick={()=>!todayWellness&&setTab('wellness')}>
                <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color: todayWellness?'var(--lime)':'#f87171', marginBottom:4, letterSpacing:'0.06em' }}>{todayWellness?'✓ WELLNESS COMPLETADO':'⚠ WELLNESS PENDIENTE'}</div>
                <div style={{ fontSize:12, color:'var(--silver)' }}>{todayWellness?`Registrado el ${todayWellness.fecha}`:'Tocá para completar ahora →'}</div>
              </div>
              {todayWellness && (
                <div style={{ flex:1, minWidth:140, background: todayWellness.entrena_grupo?'rgba(34,197,94,.08)':'rgba(239,68,68,.08)', border:`1px solid ${todayWellness.entrena_grupo?'rgba(34,197,94,.25)':'rgba(239,68,68,.25)'}`, borderRadius:12, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color: todayWellness.entrena_grupo?'#4ade80':'#f87171', marginBottom:4, letterSpacing:'0.06em' }}>{todayWellness.entrena_grupo?'✓ DISPONIBLE HOY':'✗ DIFERENCIADO'}</div>
                  <div style={{ fontSize:12, color:'var(--silver)' }}>{todayWellness.fue_gimnasio?'🏋 Fue al gimnasio':'No fue al gimnasio'}</div>
                </div>
              )}
            </div>

            {/* Estado del día */}
            <div className="anim-up delay-1" style={{ background:'var(--ink2)', border:'1px solid var(--mist)', borderRadius:20, padding:'24px', position:'relative', overflow:'hidden' }}>
              <div className="scanline" />
              <p style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>Tu estado de hoy</p>
              {(() => {
                const tw = lastW ? (n(lastW.fatiga)+n(lastW.calidad_sueno)+n(lastW.dolor_muscular)+n(lastW.nivel_estres)+n(lastW.estado_animo)) : 0
                const ready = tw>0&&tw<=12 ? {label:'Listo para entrenar 💪', col:'#c8f135', msg:'Tu nivel de bienestar es óptimo para la sesión de hoy.'} :
                              tw<=18 ? {label:'Atención Wellness ⚠️', col:'#f59e0b', msg:'Prestá atención a cómo te sentís durante el entrenamiento.'} :
                              tw>18  ? {label:'Descarga recomendada 🔴', col:'#ef4444', msg:'Informale al profe cómo estás. Puede que necesites adaptar la carga.'} :
                              {label:'Completá el wellness', col:'var(--silver)', msg:'Completá el cuestionario pre-entrenamiento para ver tu estado.'}
                return (
                  <div>
                    <div className="display" style={{ fontSize:38, color:ready.col, marginBottom:8 }}>{ready.label}</div>
                    <p style={{ fontSize:13, color:'var(--silver)', lineHeight:1.5 }}>{ready.msg}</p>
                    {tw>0 && (
                      <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
                        {[['Sesiones (28d)', String(recentLogs.length)], ['Carga semana', String(acwr.acuteLoad)+' UA'], ['Sesiones mes', String(recentLogs.length)]].map(([k,v])=>(
                          <div key={k} style={{ background:'var(--ink3)', border:'1px solid var(--mist)', borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                            <div className="mono" style={{ fontSize:16, color:'var(--snow)', fontWeight:600 }}>{v}</div>
                            <div style={{ fontSize:10, color:'var(--silver)', marginTop:2 }}>{k}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Profile + Wellness */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="card anim-up delay-3" style={{ padding:20 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Mi perfil</p>
                {jugador?.foto_url && (
                  <div style={{ textAlign:'center', marginBottom:14 }}>
                    <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', margin:'0 auto', border:'2px solid var(--lime)' }}>
                      <img src={jugador.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                    </div>
                  </div>
                )}
                {[['Posición',s(jugador?.posicion)],['Edad',jugador?.edad?`${jugador.edad} años`:'—'],['Peso',jugador?.peso_kg?`${jugador.peso_kg} kg`:'—'],['Estatura',jugador?.estatura_cm?`${jugador.estatura_cm} cm`:'—'],['Pie hábil',s(jugador?.pie_habil)],['Sesiones (28d)',String(recentLogs.length)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--mist)', fontSize:13 }}>
                    <span style={{ color:'var(--silver)' }}>{k}</span><span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="card anim-up delay-3" style={{ padding:20 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Último Wellness {lastW&&<span style={{ color:'var(--fog)', fontWeight:400, fontSize:10, marginLeft:6 }}>{s(lastW.fecha)}</span>}</p>
                {lastW ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {WK.map((k,i)=>{ const v=n(lastW[k]); const c=WC[v-1]||'#888'; return (
                      <div key={k} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:'var(--silver)', minWidth:46 }}>{WL[i]}</span>
                        <div style={{ flex:1, height:5, background:'var(--mist)', borderRadius:3, overflow:'hidden' }}><div style={{ width:`${v*20}%`, height:'100%', background:c, borderRadius:3 }} /></div>
                        <span className="mono" style={{ fontSize:12, color:c, minWidth:14, textAlign:'right' }}>{v}</span>
                      </div>
                    )})}
                  </div>
                ) : <p style={{ fontSize:13, color:'var(--silver)' }}>Sin registros de wellness.</p>}
              </div>
            </div>

            {recentWellness.length>1 && (
              <div className="card anim-up delay-3" style={{ padding:'20px 20px 16px' }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Tendencia Wellness</p>
                <WellnessTrend data={recentWellness} />
              </div>
            )}

            {recentLogs.length>0 && (
              <div className="card anim-up delay-3" style={{ padding:20 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Últimas sesiones</p>
                {[...recentLogs].reverse().slice(0,6).map((log,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--mist)', fontSize:13 }}>
                    <span style={{ color:'var(--silver)', fontFamily:'DM Mono,monospace', fontSize:11 }}>{s(log.fecha)}</span>
                    <span style={{ color:'var(--silver)', fontSize:11 }}>{s(log.tipo_sesion)}</span>
                    <span>RPE <strong style={{ color:'var(--snow)' }}>{n(log.rpe)}</strong></span>
                    <span style={{ color:'var(--silver)' }}>{n(log.duracion_min)} min</span>
                    <span className="mono" style={{ color:'var(--lime)', fontWeight:600 }}>{n(log.carga_ua)} UA</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className="anim-up delay-4">
              <button className="btn-ghost" style={{ padding:14, fontSize:14, width:'100%', position:'relative' }} onClick={()=>setTab('wellness')}>
                📋 Wellness Pre-Entreno
                {todayWellness && <span style={{ position:'absolute', top:8, right:10, width:8, height:8, borderRadius:'50%', background:'var(--lime)' }} />}
              </button>
              <button className="btn-lime" style={{ padding:14, fontSize:14, width:'100%' }} onClick={()=>setTab('rpe')}>⚡ Registrar Carga →</button>
            </div>
          </div>
        )}

        {tab==='wellness' && (
          <div className="anim-up">
            <div style={{ marginBottom:24 }}>
              <h2 className="display" style={{ fontSize:48, color:'var(--snow)' }}>PRE-ENTRENO</h2>
              <p style={{ color:'var(--silver)', fontSize:14, marginTop:4 }}>Completá ANTES del entrenamiento de hoy.</p>
            </div>
            <div className="card" style={{ padding:28 }}>
              <WellnessForm jugadorId={jugadorId} todayWellness={todayWellness} onSuccess={()=>{ setTab('dashboard'); router.refresh() }} />
            </div>
          </div>
        )}

        {tab==='rpe' && (
          <div className="anim-up">
            <div style={{ marginBottom:24 }}>
              <h2 className="display" style={{ fontSize:48, color:'var(--snow)' }}>POST-ENTRENO</h2>
              <p style={{ color:'var(--silver)', fontSize:14, marginTop:4 }}>Completar 15–30 min después de finalizar.</p>
            </div>
            <div className="card" style={{ padding:28 }}>
              <RPEForm jugadorId={jugadorId} onSuccess={()=>{ setTab('dashboard'); router.refresh() }} />
            </div>
          </div>
        )}

        {tab==='config' && (
          <PlayerConfig jugadorId={jugadorId} jugador={jugador} onSaved={()=>router.refresh()} />
        )}
      </main>
    </div>
  )
}

function PlayerConfig({ jugadorId, jugador, onSaved }) {
  const [email, setEmail] = useState(jugador?.email||'')
  const [hora, setHora] = useState(jugador?.hora_recordatorio||'08:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`/api/players/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email||null, hora_recordatorio: hora }),
      })
      setSaved(true); setTimeout(()=>setSaved(false), 2000)
      onSaved()
    } finally { setSaving(false) }
  }

  const HORAS = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

  return (
    <div className="anim-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <h2 className="display" style={{ fontSize:48, color:'var(--snow)' }}>MI PERFIL</h2>
        <p style={{ color:'var(--silver)', fontSize:14, marginTop:4 }}>Configurá tus notificaciones y datos de contacto.</p>
      </div>

      <div className="card" style={{ padding:24 }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:20 }}>
          🔔 Recordatorio Diario de Wellness
        </p>
        <p style={{ fontSize:13, color:'var(--silver)', marginBottom:20, lineHeight:1.6 }}>
          La app te va a mandar un email a la hora que elijas si todavía no completaste el cuestionario de wellness del día.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
              📧 Tu email para notificaciones
            </label>
            <input
              className="wp-input" type="email" value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="tuemail@gmail.com"
            />
            <p style={{ fontSize:11, color:'var(--fog)', marginTop:5 }}>Solo se usa para enviarte recordatorios. Nadie más lo ve.</p>
          </div>

          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
              ⏰ Horario del recordatorio
            </label>
            <select className="wp-input" value={hora} onChange={e=>setHora(e.target.value)} style={{ appearance:'none' }}>
              {HORAS.map(h=>(
                <option key={h} value={h} style={{ background:'var(--ink2)' }}>{h} hs</option>
              ))}
            </select>
            <p style={{ fontSize:11, color:'var(--fog)', marginTop:5 }}>
              Si a esa hora no completaste el wellness, te llega un recordatorio por email.
            </p>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-lime" style={{ width:'100%', padding:14, fontSize:14, marginTop:20 }}>
          {saved ? '✓ GUARDADO' : saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN →'}
        </button>
      </div>

      {/* Info card */}
      <div style={{ background:'rgba(200,241,53,.06)', border:'1px solid rgba(200,241,53,.2)', borderRadius:14, padding:18 }}>
        <p style={{ fontSize:12, color:'var(--lime)', fontWeight:600, marginBottom:8 }}>¿Cómo funcionan los recordatorios?</p>
        <ul style={{ fontSize:12, color:'var(--silver)', lineHeight:1.8, paddingLeft:16 }}>
          <li>Cada día a la hora que elegís, el sistema verifica si completaste el wellness</li>
          <li>Si no lo completaste, te manda un email con un link directo al formulario</li>
          <li>Si ya lo completaste, no te molesta</li>
          <li>Podés cambiar el horario cuando quieras desde esta pantalla</li>
        </ul>
      </div>
    </div>
  )
}
