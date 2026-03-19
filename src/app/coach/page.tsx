import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { calcACWR } from '@/lib/acwr'
import CoachClient from './CoachClient'

const POS_ORDER = {'portero':1,'defensa central':2,'lateral derecho':2,'lateral izquierdo':2,'defensa':2,'mediocampista':3,'mediocentro':3,'mediocentro defensivo':3,'mediocentro ofensivo':3,'volante':4,'volante derecho':4,'volante izquierdo':4,'extremo':5,'extremo derecho':5,'extremo izquierdo':5,'delantero':6,'centro delantero':6}
function posOrder(pos) { return pos ? (POS_ORDER[String(pos).toLowerCase()] ?? 99) : 99 }

export default async function CoachPage() {
  const session = await getSession()
  if (!session || session.rol !== 'admin') redirect('/login')
  const sql = getDb()
  const today = new Date().toISOString().split('T')[0]

  const [players, lesionesRows] = await Promise.all([
    sql`SELECT u.id, u.nombre, u.usuario, u.activo, j.id AS jugador_id, j.posicion, j.edad, j.peso_kg::text AS peso_kg, j.estatura_cm, j.pie_habil, j.foto_url, j.foto_url FROM usuarios u JOIN jugadores j ON j.usuario_id=u.id WHERE u.rol='jugador' ORDER BY u.nombre`,
    sql`SELECT jugador_id::int, tipo_lesion, zona, estado, eta_dias::int, fecha_inicio::text FROM lesiones WHERE activa=true`,
  ])

  const lesionMap = {}
  for (const l of lesionesRows) {
    lesionMap[l.jugador_id] = { tipo_lesion:String(l.tipo_lesion||''), zona:String(l.zona||''), estado:String(l.estado||''), eta_dias:Number(l.eta_dias)||null, fecha_inicio:String(l.fecha_inicio||'') }
  }

  const teamData = await Promise.all(players.map(async (p) => {
    const [logs, wRows] = await Promise.all([
      sql`SELECT fecha::text, carga_ua::int, rpe::int, duracion_min::int FROM entrenamiento_logs WHERE jugador_id=${p.jugador_id} AND fecha>=CURRENT_DATE-28 ORDER BY fecha ASC`,
      sql`SELECT fecha::text, fatiga::int, calidad_sueno::int, dolor_muscular::int, nivel_estres::int, estado_animo::int, dolor_zona, COALESCE(tqr::int,0) AS tqr, COALESCE(recovery::int,0) AS recovery, COALESCE(entrena_grupo::text,'true') AS entrena_grupo, COALESCE(fue_gimnasio::text,'false') AS fue_gimnasio, COALESCE(grupos_musculares,'') AS grupos_musculares FROM wellness_logs WHERE jugador_id=${p.jugador_id} ORDER BY fecha DESC LIMIT 1`,
    ])
    const sl = logs.map(l=>({ fecha:String(l.fecha), carga_ua:Number(l.carga_ua)||0 }))
    const rw = wRows[0]
    const lastW = rw ? { fecha:String(rw.fecha), fatiga:Number(rw.fatiga)||0, calidad_sueno:Number(rw.calidad_sueno)||0, dolor_muscular:Number(rw.dolor_muscular)||0, nivel_estres:Number(rw.nivel_estres)||0, estado_animo:Number(rw.estado_animo)||0, dolor_zona:String(rw.dolor_zona||''), tqr:Number(rw.tqr)||0, recovery:Number(rw.recovery)||0, entrena_grupo:String(rw.entrena_grupo)!=='false', fue_gimnasio:String(rw.fue_gimnasio)==='true', grupos_musculares:String(rw.grupos_musculares||'') } : null
    const respondedToday = lastW?.fecha === today
    return {
      id:p.id, nombre:String(p.nombre), usuario:String(p.usuario), activo:Boolean(p.activo),
      jugador_id:p.jugador_id, posicion:String(p.posicion||''), edad:Number(p.edad)||null,
      peso_kg:String(p.peso_kg||''), estatura_cm:Number(p.estatura_cm)||null, pie_habil:String(p.pie_habil||''), foto_url:p.foto_url?String(p.foto_url):null, email:p.email?String(p.email):null, fecha_nacimiento:p.fecha_nacimiento?String(p.fecha_nacimiento):null, hora_recordatorio:String(p.hora_recordatorio||'08:00'),
      posicion_orden:posOrder(p.posicion), acwr:calcACWR(sl),
      recentLogs:logs.map(l=>({ fecha:String(l.fecha), carga_ua:Number(l.carga_ua)||0, rpe:Number(l.rpe)||0, duracion_min:Number(l.duracion_min)||0 })),
      lastWellness:lastW, respondedToday, entrena_grupo:respondedToday?(lastW?.entrena_grupo??null):null,
      lesion:lesionMap[p.jugador_id]||null,
    }
  }))

  const sorted = [...teamData].sort((a,b) => a.posicion_orden!==b.posicion_orden ? a.posicion_orden-b.posicion_orden : a.nombre.localeCompare(b.nombre))
  return <CoachClient session={session} teamData={sorted} today={today} />
}
