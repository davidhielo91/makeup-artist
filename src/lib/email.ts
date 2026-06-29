import { Resend } from 'resend'

// ─── Cliente ──────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY ?? '')

/** Devuelve false si la clave no está configurada o es el placeholder. */
function emailEnabled() {
  const k = process.env.RESEND_API_KEY ?? ''
  return k.startsWith('re_') && !k.includes('placeholder')
}

const FROM = process.env.FROM_EMAIL ?? 'Renata Belmonte <onboarding@resend.dev>'
const RENATA_EMAIL = 'hola@renatabelmonte.mx'
const SITE_URL     = 'https://www.renatabelmonte.mx'
const WA_PHONE     = '526562184490'

// ─── Tipos ────────────────────────────────────────────────────────

export interface BookingEmailData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startsAt: string       // ISO timestamp
  serviceName: string
  servicePrice: number
  atHome: boolean
  eventType: string | null
  allergies: string | null
  referenceNotes: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Chihuahua',
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Chihuahua',
  })
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n)
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Envoltura HTML compartida (header dark + body + footer dark). */
function emailLayout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Renata Belmonte</title>
</head>
<body style="margin:0;padding:40px 20px;background-color:#F4F0E9;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:500px;margin:0 auto;">

    <!-- Header -->
    <div style="background-color:#1A1A1A;border-radius:6px 6px 0 0;padding:24px 32px;">
      <p style="color:#C2603F;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">✦ Makeup Artist · Ciudad Juárez</p>
      <p style="color:#F4F0E9;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;margin:0;">Renata Belmonte</p>
    </div>

    <!-- Cuerpo -->
    <div style="background-color:#ffffff;border-left:1px solid #E0DAD0;border-right:1px solid #E0DAD0;padding:32px;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background-color:#0E0E0E;border-radius:0 0 6px 6px;padding:20px 32px;text-align:center;">
      <p style="color:#6B6B6B;font-size:12px;margin:0 0 4px 0;">hola@renatabelmonte.mx · +52 656 218 4490</p>
      <p style="color:#6B6B6B;font-size:12px;margin:0 0 8px 0;">Av. de las Torres 1450, Col. Campestre, Cd. Juárez</p>
      <a href="${SITE_URL}" style="color:#C2603F;font-size:12px;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
    </div>

  </div>
</body>
</html>`
}

/** Tarjeta con el resumen de la cita. */
function bookingCard(d: BookingEmailData): string {
  return `
    <div style="background-color:#F4F0E9;border-radius:6px;padding:20px;margin:0 0 24px 0;">
      <p style="color:#C2603F;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px 0;">Resumen de tu cita</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#1A1A1A;font-weight:400;margin:0 0 10px 0;">${d.serviceName}</p>
      <p style="color:#1A1A1A;font-size:14px;margin:0 0 5px 0;">📅 ${cap(fmtDate(d.startsAt))}</p>
      <p style="color:#1A1A1A;font-size:14px;margin:0 0 5px 0;">⏰ ${fmtTime(d.startsAt)} h</p>
      ${d.atHome ? '<p style="color:#C2603F;font-size:14px;margin:0 0 5px 0;">🏠 Servicio a domicilio (+$300)</p>' : ''}
      <p style="color:#6B6B6B;font-size:13px;margin:10px 0 0 0;">desde ${fmtPrice(d.servicePrice)} MXN</p>
    </div>`
}

/** Botón de CTA (WhatsApp o link genérico). */
function ctaButton(href: string, text: string): string {
  return `<a href="${href}" style="display:block;background-color:#C2603F;color:#F4F0E9;text-align:center;text-decoration:none;padding:14px 24px;border-radius:6px;font-size:14px;margin:0 0 24px 0;">${text}</a>`
}

function pago(): string {
  return `
    <div style="border-top:1px solid #E0DAD0;padding-top:20px;margin-top:4px;">
      <p style="color:#6B6B6B;font-size:13px;line-height:1.7;margin:0;">
        <strong style="color:#1A1A1A;">Pago:</strong> en efectivo o transferencia el día del servicio.
        Sin pago en línea. Para bodas y eventos grandes, Renata te indicará el anticipo del&nbsp;30&nbsp;%
        al confirmar la cita.
      </p>
    </div>`
}

// ─── Correo 1: Confirmación al cliente ───────────────────────────

export async function sendConfirmationToCustomer(d: BookingEmailData) {
  if (!emailEnabled()) {
    console.log('[email] RESEND_API_KEY sin configurar — omitiendo confirmación al cliente')
    return
  }

  const waMsg = encodeURIComponent(
    `Hola Renata, acabo de reservar una cita:\n\n` +
    `📋 Servicio: ${d.serviceName}\n` +
    `📅 Fecha: ${cap(fmtDate(d.startsAt))}\n` +
    `⏰ Hora: ${fmtTime(d.startsAt)} h\n\n` +
    `¿Me confirmas disponibilidad? 😊`
  )

  const body = `
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#1A1A1A;margin:0 0 12px 0;">
      ¡Hola, ${d.customerName.split(' ')[0]}!
    </h2>
    <p style="color:#C2603F;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Solicitud recibida</p>
    <p style="color:#6B6B6B;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
      Tu solicitud de cita ha sido recibida. Renata la revisará y te confirmará pronto por
      correo y WhatsApp. ¡Gracias por tu confianza!
    </p>
    ${bookingCard(d)}
    ${ctaButton(`https://wa.me/${WA_PHONE}?text=${waMsg}`, '📱 Confirmar por WhatsApp')}
    ${pago()}
  `

  await resend.emails.send({
    from:    FROM,
    to:      [d.customerEmail],
    subject: `Tu cita está en revisión ✦ Renata Belmonte`,
    html:    emailLayout(body),
  })
}

// ─── Correo 2: Alerta a Renata (nueva reserva) ───────────────────

export async function sendNewBookingAlert(d: BookingEmailData) {
  if (!emailEnabled()) {
    console.log('[email] RESEND_API_KEY sin configurar — omitiendo alerta a Renata')
    return
  }

  const adminUrl = `${SITE_URL}/admin`
  const rows = [
    ['Nombre',   d.customerName],
    ['Correo',   d.customerEmail],
    ['Teléfono', d.customerPhone],
    ['Servicio', d.serviceName],
    ['Fecha',    cap(fmtDate(d.startsAt))],
    ['Hora',     fmtTime(d.startsAt) + ' h'],
    ...(d.eventType      ? [['Evento',    d.eventType]]      : []),
    ...(d.atHome         ? [['Domicilio', 'Sí (+$300)']]     : []),
    ...(d.allergies      ? [['Alergias',  d.allergies]]      : []),
    ...(d.referenceNotes ? [['Notas',     d.referenceNotes]] : []),
  ]

  const tableRows = rows.map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#6B6B6B;background:#F4F0E9;border-bottom:1px solid #E0DAD0;white-space:nowrap;">${k}</td>
      <td style="padding:8px 12px;font-size:13px;color:#1A1A1A;border-bottom:1px solid #E0DAD0;">${v}</td>
    </tr>`).join('')

  const body = `
    <p style="color:#C2603F;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Nueva solicitud de cita</p>
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1A1A1A;margin:0 0 20px 0;">
      ${d.customerName}
    </h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E0DAD0;border-radius:6px;overflow:hidden;margin:0 0 24px 0;">
      <tbody>${tableRows}</tbody>
    </table>
    ${ctaButton(adminUrl, '→ Gestionar en el panel')}
    <p style="color:#6B6B6B;font-size:13px;margin:0;line-height:1.7;">
      Responde directamente a este correo o escribe al cliente por WhatsApp al
      <a href="https://wa.me/52${d.customerPhone.replace(/\D/g, '')}" style="color:#C2603F;">+52 ${d.customerPhone}</a>.
    </p>
  `

  await resend.emails.send({
    from:     FROM,
    to:       [RENATA_EMAIL],
    replyTo:  d.customerEmail,
    subject:  `Nueva cita: ${d.customerName} — ${d.serviceName}`,
    html:     emailLayout(body),
  })
}

// ─── Correo 3: Recordatorio al cliente (24 h antes) ──────────────

export async function sendReminderToCustomer(d: BookingEmailData) {
  if (!emailEnabled()) {
    console.log('[email] RESEND_API_KEY sin configurar — omitiendo recordatorio')
    return
  }

  const waMsg = encodeURIComponent(
    `Hola Renata, tengo una cita mañana:\n` +
    `${d.serviceName} a las ${fmtTime(d.startsAt)} h.\n` +
    `Solo quería confirmar 😊`
  )

  const body = `
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#1A1A1A;margin:0 0 12px 0;">
      ¡Tu cita es mañana, ${d.customerName.split(' ')[0]}!
    </h2>
    <p style="color:#C2603F;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Recordatorio</p>
    <p style="color:#6B6B6B;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
      Te recordamos que mañana tienes una cita con Renata. ¡Te esperamos puntual!
    </p>
    ${bookingCard(d)}
    <div style="background-color:#F4F0E9;border-radius:6px;padding:16px 20px;margin:0 0 24px 0;">
      <p style="color:#1A1A1A;font-size:13px;line-height:1.7;margin:0;">
        📍 <strong>Estudio:</strong> Av. de las Torres 1450, Col. Campestre, Cd. Juárez<br>
        ⏱ Tenemos <strong>15 minutos de tolerancia</strong>. Después, el servicio puede acortarse
        para no afectar a otras clientas.
      </p>
    </div>
    ${ctaButton(`https://wa.me/${WA_PHONE}?text=${waMsg}`, '📱 Escribirle a Renata')}
    <p style="color:#6B6B6B;font-size:13px;line-height:1.7;margin:0;">
      Si necesitas cancelar o reagendar, avisa con al menos <strong>24 h de anticipación</strong>
      para evitar perder el anticipo.
    </p>
  `

  await resend.emails.send({
    from:    FROM,
    to:      [d.customerEmail],
    subject: `¡Tu cita con Renata es mañana! ✦ Recordatorio`,
    html:    emailLayout(body),
  })
}
