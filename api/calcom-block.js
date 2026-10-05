// Bloquear / desbloquear fechas en cal.com desde el Panel de Fechas.
//
// Un "bloqueo" es un date override en el schedule de cal.com:
//   - Día completo  -> override 00:00–00:00 (sin disponibilidad ese día)
//   - Bloquear mañana (dejar tarde)  -> override 16:00–20:00
//   - Bloquear tarde (dejar mañana)  -> override 10:00–14:00
// Los overrides de cal.com REEMPLAZAN la lista entera, así que leemos la actual,
// aplicamos el cambio y volvemos a enviarla completa.
//
// GET  /api/calcom-block?scheduleId=123   -> { overrides: [...] }
// POST /api/calcom-block  { scheduleId, date, mode: 'full'|'morning'|'afternoon', action: 'block'|'unblock' }

const CAL_BASE = 'https://api.cal.com/v2';
const CAL_VERSION = '2024-06-11';
const MORNING = { startTime: '10:00', endTime: '14:00' };
const AFTERNOON = { startTime: '16:00', endTime: '20:00' };

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'cal-api-version': CAL_VERSION,
    'Content-Type': 'application/json',
  };
}

async function getOverrides(token, scheduleId) {
  const res = await fetch(`${CAL_BASE}/schedules/${scheduleId}`, { headers: headers(token) });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`cal.com GET ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  return json?.data?.overrides || [];
}

async function patchOverrides(token, scheduleId, overrides) {
  const res = await fetch(`${CAL_BASE}/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ overrides }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`cal.com PATCH ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  return json?.data?.overrides || overrides;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.CALCOM_API_KEY;
  if (!token) return res.status(500).json({ error: 'CALCOM_API_KEY no configurada en Vercel.' });

  try {
    if (req.method === 'GET') {
      const scheduleId = req.query.scheduleId;
      if (!scheduleId) return res.status(400).json({ error: 'Falta scheduleId' });
      const overrides = await getOverrides(token, scheduleId);
      return res.status(200).json({ overrides });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
      const scheduleId = body?.scheduleId;
      const date = body?.date;
      const mode = body?.mode || 'full';
      const action = body?.action || 'block';

      if (!scheduleId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
        return res.status(400).json({ error: 'scheduleId y date (YYYY-MM-DD) requeridos' });
      }

      const current = await getOverrides(token, scheduleId);
      // Quitamos cualquier override existente de esa fecha; luego añadimos el nuevo.
      const rest = current.filter((o) => o.date !== date);

      let next = rest;
      if (action === 'block') {
        let win;
        if (mode === 'morning') win = AFTERNOON;      // bloquea mañana -> solo tarde disponible
        else if (mode === 'afternoon') win = MORNING; // bloquea tarde -> solo mañana disponible
        else win = { startTime: '00:00', endTime: '00:00' }; // día completo
        next = [...rest, { date, startTime: win.startTime, endTime: win.endTime }];
      }
      // action 'unblock' -> deja rest (sin la fecha)

      const saved = await patchOverrides(token, scheduleId, next);
      return res.status(200).json({ ok: true, overrides: saved });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
