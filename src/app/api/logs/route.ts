import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'
export async function GET(req: NextRequest) {
  const s = await getSessionFromRequest(req); if(!s) return NextResponse.json({error:'No autorizado'},{status:401})
  const {searchParams} = new URL(req.url); const jid = searchParams.get('jugadorId'); const days = parseInt(searchParams.get('days')||'28')
  if (s.rol==='jugador'&&String(s.jugadorId)!==jid) return NextResponse.json({error:'No autorizado'},{status:403})
  const sql = getDb()
  const r = await sql`SELECT fecha::text,carga_ua::int,rpe::int,duracion_min::int,tipo_sesion FROM entrenamiento_logs WHERE jugador_id=${jid} AND fecha>=CURRENT_DATE-${days}::int ORDER BY fecha ASC`
  return NextResponse.json(r)
}
export async function POST(req: NextRequest) {
  const s = await getSessionFromRequest(req); if(!s) return NextResponse.json({error:'No autorizado'},{status:401})
  const {jugador_id,rpe,duracion_min,tipo_sesion,fecha} = await req.json()
  if (s.rol==='jugador'&&s.jugadorId!==jugador_id) return NextResponse.json({error:'No autorizado'},{status:403})
  if (rpe===null||rpe===undefined||!duracion_min) return NextResponse.json({error:'RPE y duración requeridos'},{status:400})
  const sql = getDb(); const d = fecha||new Date().toISOString().split('T')[0]
  const [r] = await sql`INSERT INTO entrenamiento_logs(jugador_id,rpe,duracion_min,tipo_sesion,fecha) VALUES(${jugador_id},${rpe},${duracion_min},${tipo_sesion||'EQUIPO'},${d}) RETURNING id,fecha::text,carga_ua::int`
  return NextResponse.json(r)
}
