'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/ui/Topbar'
import WellnessForm from '@/components/forms/WellnessForm'
import RPEForm from '@/components/forms/RPEForm'
import ACWRChart from '@/components/charts/ACWRChart'
import WellnessTrend from '@/components/charts/WellnessTrend'

const TABS = [{id:'dashboard',label:'Mi Estado'},{id:'wellness',label:'Wellness Pre-Entreno'},{id:'rpe',label:'Registrar Carga'}]
const SC = {optimo:'#22c55e',precaucion:'#f59e0b',peligro:'#ef4444',sin_datos:'#888'}
const SL = {optimo:'ESTADO ÓPTIMO',precaucion:'PRECAUCIÓN',peligro:'RIESGO DE LESIÓN',sin_datos:'SIN DATOS'}
const WK = ['fatiga','calidad_sueno','dolor_muscular','nivel_estres','estado_animo']
const WL = ['Fatiga','Sueño','Dolor','Estrés','Ánimo']
const WC = ['#c8f135','#22c55e','#eab308','#f97316','#ef4444']
const s = (v) => v==null?'—':String(v)
const n = (v) => Number(v)||0

export default function PlayerClient({ session, jugador, jugadorId, acwr, acwrHistory, recentLogs, recentWellness, todayWellness, today }) {
  const [tab, setTab] = useState('dashboard')
  const router = useRouter()
  const lastW = recentWellness[0]
  const col = SC[acwr.status]||'#888'

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

            {/* ACWR Hero */}
            <div className="anim-up delay-1" style={{ background:'var(--ink2)', border:`1px solid ${col}44`, borderRadius:20, padding:'28px 28px 24px', position:'relative', overflow:'hidden' }}>
              <div className="scanline" />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                <div>
                  <p style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Ratio ACWR · Hoy</p>
                  <div className="display" style={{ fontSize:96, color:col, lineHeight:0.9 }}>{acwr.ratio>0?acwr.ratio.toFixed(2):'—'}</div>
                  <p style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:col, marginTop:10, letterSpacing:'0.06em' }}>{SL[acwr.status]}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:120 }}>
                  {[['Carga 7d',acwr.acuteLoad],['Carga 28d',acwr.chronicLoad]].map(([lbl,val])=>(
                    <div key={lbl} style={{ background:'var(--ink3)', border:'1px solid var(--mist)', borderRadius:10, padding:'10px 14px', textAlign:'right' }}>
                      <div className="mono" style={{ fontSize:18, fontWeight:500, color:'var(--snow)' }}>{n(val)}</div>
                      <div style={{ fontSize:10, color:'var(--silver)', marginTop:2 }}>{lbl} UA</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACWR Chart */}
            <div className="card anim-up delay-2" style={{ padding:'20px 20px 16px' }}>
              <p style={{ fontSize:11, fontWeight:600, color:'var(--silver)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Evolución ACWR — 28 días</p>
              <ACWRChart data={acwrHistory} />
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
      </main>
    </div>
  )
}
