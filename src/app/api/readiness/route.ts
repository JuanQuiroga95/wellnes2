import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const s = await getSessionFromRequest(req)
  if (!s || s.rol !== 'admin') return NextResponse.json({error:'No autorizado'},{status:403})
  const { searchParams } = new URL(req.url)
  const weeks = parseInt(searchParams.get('weeks')||'4')
  const sql = getDb()

  // Weekly wellness averages per player
  const wRows = await sql`
    SELECT
      j.id AS jugador_id, u.nombre, j.posicion, j.foto_url,
      DATE_TRUNC('week', w.fecha)::text AS semana,
      ROUND(AVG(w.fatiga+w.calidad_sueno+w.dolor_muscular+w.nivel_estres+w.estado_animo),1)::float AS total_wellness,
      ROUND(AVG(w.fatiga),2)::float AS avg_fatiga,
      ROUND(AVG(w.calidad_sueno),2)::float AS avg_sueno,
      ROUND(AVG(w.dolor_muscular),2)::float AS avg_dolor,
      ROUND(AVG(w.nivel_estres),2)::float AS avg_estres,
      ROUND(AVG(w.estado_animo),2)::float AS avg_animo,
      ROUND(AVG(w.tqr),2)::float AS avg_tqr,
      COUNT(*)::int AS registros
    FROM wellness_logs w
    JOIN jugadores j ON j.id=w.jugador_id
    JOIN usuarios u ON u.id=j.usuario_id
    WHERE w.fecha >= CURRENT_DATE - (${weeks}*7)
      AND w.fatiga IS NOT NULL
    GROUP BY j.id, u.nombre, j.posicion, j.foto_url, DATE_TRUNC('week',w.fecha)
    ORDER BY semana DESC, u.nombre
  `

  // Weekly RPE averages per player
  const rpeRows = await sql`
    SELECT
      jugador_id::int,
      DATE_TRUNC('week', fecha)::text AS semana,
      ROUND(AVG(rpe),2)::float AS avg_rpe,
      ROUND(SUM(carga_ua),0)::float AS total_carga,
      COUNT(*)::int AS sesiones
    FROM entrenamiento_logs
    WHERE fecha >= CURRENT_DATE - (${weeks}*7)
    GROUP BY jugador_id, DATE_TRUNC('week',fecha)
    ORDER BY semana DESC
  `

  // Today's readiness for each player
  const todayRows = await sql`
    SELECT
      j.id AS jugador_id, u.nombre, j.posicion, j.foto_url,
      COALESCE(w.fatiga+w.calidad_sueno+w.dolor_muscular+w.nivel_estres+w.estado_animo, null) AS total_wellness,
      w.fatiga, w.calidad_sueno, w.dolor_muscular, w.nivel_estres, w.estado_animo,
      w.tqr, w.dolor_zona, w.dolor_eva,
      w.entrena_grupo, w.fue_gimnasio
    FROM jugadores j
    JOIN usuarios u ON u.id=j.usuario_id
    LEFT JOIN wellness_logs w ON w.jugador_id=j.id AND w.fecha=CURRENT_DATE
    WHERE u.rol='jugador' AND u.activo=true
    ORDER BY u.nombre
  `

  return NextResponse.json({ wRows, rpeRows, todayRows })
}
