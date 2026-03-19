import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendReminderEmail, sendBirthdayEmail } from '@/lib/email'

// This endpoint is called by Vercel Cron — no auth needed but uses a secret
export async function GET(req: NextRequest) {
  // Accept: our CRON_SECRET param OR Vercel's internal cron header
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cron-secret')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  if (!isVercelCron && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()
  const now = new Date()
  const currentHour = now.getHours().toString().padStart(2, '0')
  const currentMin  = Math.floor(now.getMinutes() / 30) * 30 // round to nearest 30min
  const timeSlot = `${currentHour}:${currentMin.toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]
  const todayMMDD = today.slice(5) // MM-DD

  const results: any[] = []

  // 1. Wellness reminders — players whose hora_recordatorio matches current slot
  //    and haven't completed wellness today
  const playersToRemind = await sql`
    SELECT u.nombre, j.email, j.hora_recordatorio, j.id AS jugador_id
    FROM jugadores j
    JOIN usuarios u ON u.id = j.usuario_id
    WHERE u.activo = true
      AND j.email IS NOT NULL
      AND j.hora_recordatorio = ${timeSlot}
      AND NOT EXISTS (
        SELECT 1 FROM wellness_logs w
        WHERE w.jugador_id = j.id AND w.fecha = ${today}
      )
  `

  for (const p of playersToRemind) {
    const r = await sendReminderEmail(String(p.email), String(p.nombre))
    results.push({ type: 'reminder', nombre: p.nombre, email: p.email, ...r })
  }

  // 2. Birthday alerts — send to all admin users when a player has birthday today
  const birthdays = await sql`
    SELECT u.nombre AS jugador_nombre, j.edad,
           EXTRACT(YEAR FROM AGE(NOW(), j.fecha_nacimiento))::int AS cumple_edad
    FROM jugadores j
    JOIN usuarios u ON u.id = j.usuario_id
    WHERE j.fecha_nacimiento IS NOT NULL
      AND TO_CHAR(j.fecha_nacimiento, 'MM-DD') = ${todayMMDD}
      AND u.activo = true
  `

  if (birthdays.length > 0) {
    // Get all admin emails
    const admins = await sql`
      SELECT nombre, email FROM usuarios WHERE rol = 'admin' AND activo = true AND email IS NOT NULL
    `
    for (const admin of admins) {
      for (const b of birthdays) {
        const r = await sendBirthdayEmail(
          String(admin.email),
          String(admin.nombre),
          String(b.jugador_nombre),
          Number(b.cumple_edad)
        )
        results.push({ type: 'birthday', jugador: b.jugador_nombre, to: admin.email, ...r })
      }
    }
  }

  return NextResponse.json({ ok: true, timeSlot, results })
}
