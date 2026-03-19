import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'
export async function GET(req: NextRequest) {
  const s = await getSessionFromRequest(req); if(!s||s.rol!=='admin') return NextResponse.json({error:'No autorizado'},{status:403})
  const {searchParams} = new URL(req.url); const jid = searchParams.get('jugadorId'); const desde = searchParams.get('desde')||'2024-01-01'; const hasta = searchParams.get('hasta')||new Date().toISOString().split('T')[0]
  const sql = getDb()
  const r = jid ? await sql`SELECT id,jugador_id::int,fecha::text,rival,tipo_partido,minutos::int,titular FROM partido_logs WHERE jugador_id=${jid} AND fecha BETWEEN ${desde} AND ${hasta} ORDER BY fecha DESC`
    : await sql`SELECT id,jugador_id::int,fecha::text,rival,tipo_partido,minutos::int,titular FROM partido_logs WHERE fecha BETWEEN ${desde} AND ${hasta} ORDER BY fecha DESC`
  return NextResponse.json(r)
}
export async function POST(req: NextRequest) {
  const s = await getSessionFromRequest(req); if(!s||s.rol!=='admin') return NextResponse.json({error:'No autorizado'},{status:403})
  const {jugador_id,fecha,rival,tipo_partido,minutos,titular,notas} = await req.json()
  const sql = getDb(); const d = fecha||new Date().toISOString().split('T')[0]
  const [r] = await sql`INSERT INTO partido_logs(jugador_id,fecha,rival,tipo_partido,minutos,titular,notas) VALUES(${jugador_id},${d},${rival||null},${tipo_partido||'Oficial'},${minutos||0},${titular!==false},${notas||null}) RETURNING id,fecha::text`
  return NextResponse.json(r)
}
