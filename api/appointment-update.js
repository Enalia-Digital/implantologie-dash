// PATCH Airtable appointments.attendance_status desde el dashboard, y
// reenvia el evento a n8n. Solo acepta 'attended' | 'no_show' | 'clear'
// para no ensuciar la tabla desde el UI.

const BASE_ID = 'appjepGJjnf1ID4Uo';
const APPT_TABLE = 'tblPqgB4or5EfWpYe';
// La verdad esta en appointment_status (fld3q3B11hxhG8nv6). attendance_status
// (fldx1V9Kh8xWaViJQ) quedo como columna auxiliar. Actualizamos las dos para
// mantener retrocompatibilidad con integraciones que aun lean la vieja.
const APPT_STATUS_FIELD = 'fld3q3B11hxhG8nv6';
const ATTENDANCE_FIELD = 'fldx1V9Kh8xWaViJQ';

// El webhook n8n espera GET con query params — devuelve 404 a POST.
const N8N_WEBHOOK = 'https://n8n-enalia-n8n.gjammw.easypanel.host/webhook/confirmar-asistencia';

// Valores del select attendance_status en Airtable.
const ALLOWED = new Set(['attended', 'no_show', 'clear']);

function buildWebhookUrl(payload) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    qs.set(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
  }
  return `${N8N_WEBHOOK}?${qs.toString()}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const token = process.env.AIRTABLE_PAT;
  if (!token) return res.status(500).json({ error: 'AIRTABLE_PAT not configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const recordId = body?.recordId;
  const status = String(body?.status || '').trim().toLowerCase();
  const meta = body?.meta || {};

  if (!recordId || typeof recordId !== 'string' || !recordId.startsWith('rec')) {
    return res.status(400).json({ error: 'recordId invalido' });
  }
  if (!ALLOWED.has(status)) {
    return res.status(400).json({ error: 'status debe ser attended | no_show | clear' });
  }

  const fieldValue = status === 'clear' ? null : status;

  try {
    // 1) Airtable PATCH
    const url = `https://api.airtable.com/v0/${BASE_ID}/${APPT_TABLE}/${recordId}`;
    const airtableRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          [APPT_STATUS_FIELD]: fieldValue,
          [ATTENDANCE_FIELD]: fieldValue,
        },
      }),
    });

    if (!airtableRes.ok) {
      const txt = await airtableRes.text();
      let friendly = `Airtable ${airtableRes.status}`;
      if (/INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND|NOT_AUTHORIZED/i.test(txt)) {
        friendly = 'El token de Airtable no tiene permiso de escritura. Añade el scope data.records:write al PAT en airtable.com/create/tokens y verifica que la base esta en Access.';
      } else if (/INVALID_MULTIPLE_CHOICE_OPTIONS|Cannot parse value/i.test(txt)) {
        friendly = 'Airtable rechazo el valor. Revisa que las opciones "attended" y "no_show" existen en el select attendance_status.';
      }
      return res.status(airtableRes.status).json({ error: friendly, detail: txt });
    }
    const json = await airtableRes.json();

    // 2) Reenvio a n8n via GET con query params.
    //    Fire-and-forget: si falla no rompe la confirmacion, se reporta en la
    //    respuesta para poder debuggearlo desde el cliente.
    let webhookOk = null;
    let webhookErr = null;
    let webhookStatus = null;
    try {
      const payload = {
        source: 'dashboard-implantologie',
        event: 'confirmar_asistencia',
        recordId,
        appointmentId: meta.appointmentId || '',
        leadId: meta.leadId || '',
        patientName: meta.nombre || '',
        clinicKey: meta.clinicKey || '',
        clinicRaw: meta.clinicRaw || '',
        appointmentStart: meta.appointmentStart || '',
        phone: meta.phone || '',
        status,
        asistio: status === 'attended',
        noShow: status === 'no_show',
        cleared: status === 'clear',
        confirmedAt: new Date().toISOString(),
      };

      const webhookUrl = buildWebhookUrl(payload);
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 8000);
      const webhookRes = await fetch(webhookUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(to);
      webhookOk = webhookRes.ok;
      webhookStatus = webhookRes.status;
      if (!webhookRes.ok) {
        const txt = await webhookRes.text().catch(() => '');
        webhookErr = `n8n ${webhookRes.status}: ${txt.slice(0, 200)}`;
      }
      console.log('[appointment-update] n8n webhook', { ok: webhookOk, status: webhookStatus });
    } catch (e) {
      webhookOk = false;
      webhookErr = e.message;
      console.error('[appointment-update] n8n webhook error:', e);
    }

    return res.status(200).json({
      ok: true,
      record: json,
      webhook: { ok: webhookOk, status: webhookStatus, error: webhookErr },
    });
  } catch (err) {
    console.error('[appointment-update] error:', err);
    return res.status(502).json({ error: err.message });
  }
}
