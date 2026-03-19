import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'W&P App <noreply@resend.dev>'

export async function sendReminderEmail(to: string, nombre: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: '📋 Recordatorio: Completá tu Wellness de hoy',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#eee;padding:32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-block;background:#c8f135;border-radius:8px;padding:8px 16px">
              <span style="font-size:20px;font-weight:900;color:#000;letter-spacing:1px">W&P</span>
            </div>
          </div>
          <h2 style="color:#c8f135;margin:0 0 12px">¡Hola, ${nombre}! 👋</h2>
          <p style="color:#aaa;line-height:1.6;margin:0 0 20px">
            Todavía no completaste el cuestionario de <strong style="color:#fff">Wellness Pre-Entrenamiento</strong> de hoy.
          </p>
          <p style="color:#aaa;line-height:1.6;margin:0 0 28px">
            Solo toma 2 minutos y ayuda al cuerpo técnico a cuidar tu rendimiento y salud.
          </p>
          <div style="text-align:center">
            <a href="${process.env.NEXTAUTH_URL || 'https://tu-app.vercel.app'}/player"
               style="display:inline-block;background:#c8f135;color:#000;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
              Completar Wellness →
            </a>
          </div>
          <p style="color:#555;font-size:11px;text-align:center;margin-top:28px">
            Para cambiar el horario de este recordatorio, entrá a la app → Mi Perfil.
          </p>
        </div>
      `,
    })
    return { ok: true }
  } catch (err) {
    console.error('Email error:', err)
    return { ok: false, error: String(err) }
  }
}

export async function sendBirthdayEmail(to: string, coachNombre: string, jugadorNombre: string, edad?: number) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🎂 Cumpleaños hoy: ${jugadorNombre}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#eee;padding:32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-block;background:#c8f135;border-radius:8px;padding:8px 16px">
              <span style="font-size:20px;font-weight:900;color:#000;letter-spacing:1px">W&P</span>
            </div>
          </div>
          <div style="text-align:center;font-size:48px;margin:16px 0">🎂</div>
          <h2 style="color:#c8f135;margin:0 0 12px;text-align:center">¡Hoy cumple años ${jugadorNombre}!</h2>
          ${edad ? `<p style="color:#aaa;text-align:center;margin:0 0 20px">Cumple <strong style="color:#fff">${edad} años</strong> hoy.</p>` : ''}
          <p style="color:#aaa;line-height:1.6;margin:0 0 28px;text-align:center">
            ¡No te olvides de saludarlo, ${coachNombre}! 🎉
          </p>
          <div style="text-align:center">
            <a href="${process.env.NEXTAUTH_URL || 'https://tu-app.vercel.app'}/coach"
               style="display:inline-block;background:#c8f135;color:#000;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
              Ver plantilla →
            </a>
          </div>
        </div>
      `,
    })
    return { ok: true }
  } catch (err) {
    console.error('Birthday email error:', err)
    return { ok: false, error: String(err) }
  }
}
