const BASE_ID = 'appjepGJjnf1ID4Uo';

const TABLES = {
  leads: 'tblqY3lcfPumQMzVS',
  calls: 'tblgsFPaYY7FwXYQT',
  appointments: 'tblPqgB4or5EfWpYe',
  call_tasks: 'tbld09khfG4gbjiHJ',
};

const FIELDS = {
  leads: [
    'fld4KeT6ob7SOGCYb', // lead_id
    'fldtFuF5ElUuDWro7', // full_name
    'fldcVE7midVm4IVsM', // status
    'fld1Mp2GWC72U9UZX', // preferred_clinic_id
    'fldq0gITmTYgB8gwh', // adset_name
    'fldtO37CyPJ3ffrCU', // campaign_name
    'fldeffknd4PVGIK7Q', // phone
    'fldHiWueiB15IWGdW', // main_objection
    'fldOpn4CB8SFz4EVy', // callback_needed
    'fldGmGucSFIxPB1yd', // ha_acudido
    'fldsXibskwiGbSr0U', // last_contact_at
    'fldqPNT9QE4RsBWbm', // appointment_id
    'fldTh6L03bGGj43Em', // created_at (fecha real de entrada)
  ],
  calls: [
    'fldJPcVfHrXDdd5h2', // call_id
    'fldce7JXojeTONxY5', // lead_id
    'fldZCWgZAdmkpCy6Q', // phone
    'fldaJVlP44bNUVYsK', // call_outcome
    'fldGgJtbmNqEh9vv6', // duration_seconds
    'fldkXfQg5FJRbgh9a', // cost_eur
    'fld123NWL2yHa12Y1', // main_objection
    'fldS5G3t2H2tdmO3D', // started_at
    'fld1kEbTjCilbt5zi', // ended_at
    'fldJD1NpOkJZtKxQP', // recording_url
    'fld0yyXMZgD42Xx7u', // summary
    'fldATKjCrxyb7aHFM', // full_name
    'fldOlBx1erJavJOtR', // calificacion (rating 1-5)
  ],
  appointments: [
    'fldEen63Bk1HM6Xhi', // appointment_id
    'fldvRGGLAMFdNfDkm', // lead_id
    'flduCoP8JXMv9wknb', // clinic_id
    'fld3q3B11hxhG8nv6', // appointment_status
    'fldQU8Nilom97dJLH', // patient_name
    'fldQ3Viw1vHKiBMkL', // appointment_start
    'fldx1V9Kh8xWaViJQ', // attendance_status
    'fldOcyUlA41RqNgUn', // showed_up
    'fldiY9gt8q0jWTegZ', // created_at
    'fldHANxTYxcrjdjY8', // phone
  ],
  call_tasks: [
    'fldGbpq0zFjNSWzf4', // task_id
    'fldQZ1p55LhPyC8ya', // lead_id
    'fld73tQUl4xvyqeTP', // clinic_id
    'fldS0M84peGoJCdlR', // phone
    'fldL5incE7OY7NqKJ', // full_name
    'fldc3F9WBf6sRosaO', // callback_at
    'fldc1nqJL8LgSKUei', // task_status
    'fldhaBwIbffqMUSb8', // attempt_count
    'fldQBiLSOV66Aris5', // max_attempts
    'fldif2AITDnZde44I', // callback_reason
    'fld8GG7VJPVwnCypC', // created_at
  ],
};

async function fetchTable(token, tableName) {
  const tableId = TABLES[tableName];
  // Copia mutable: si Airtable rechaza un campo (renombrado/borrado en el base),
  // lo descartamos y reintentamos en vez de dejar el dashboard a cero.
  let fields = [...FIELDS[tableName]];

  const buildParams = (offset) => {
    const params = new URLSearchParams();
    fields.forEach((f) => params.append('fields[]', f));
    params.set('pageSize', '100');
    params.set('returnFieldsByFieldId', 'true');
    if (offset) params.set('offset', offset);
    return params;
  };

  let allRecords = [];
  let offset = null;

  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?${buildParams(offset)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      const txt = await res.text();
      const unknown = txt.match(/Unknown field name: \\?"(fld[A-Za-z0-9]+)\\?"/);
      if (res.status === 422 && unknown && fields.includes(unknown[1])) {
        console.warn(`Airtable ${tableName}: campo desconocido ${unknown[1]}, se omite`);
        fields = fields.filter((f) => f !== unknown[1]);
        continue;
      }
      throw new Error(`Airtable ${tableName}: ${res.status} ${txt}`);
    }

    const json = await res.json();
    allRecords = allRecords.concat(json.records);
    offset = json.offset || null;
  } while (offset);

  return allRecords;
}

function fieldMap(tableName) {
  const maps = {
    leads: {
      fld4KeT6ob7SOGCYb: 'lead_id',
      fldtFuF5ElUuDWro7: 'full_name',
      fldcVE7midVm4IVsM: 'status',
      fld1Mp2GWC72U9UZX: 'preferred_clinic_id',
      fldq0gITmTYgB8gwh: 'adset_name',
      fldtO37CyPJ3ffrCU: 'campaign_name',
      fldeffknd4PVGIK7Q: 'phone',
      fldHiWueiB15IWGdW: 'main_objection',
      fldOpn4CB8SFz4EVy: 'callback_needed',
      fldGmGucSFIxPB1yd: 'ha_acudido',
      fldsXibskwiGbSr0U: 'last_contact_at',
      fldqPNT9QE4RsBWbm: 'appointment_id',
      fldTh6L03bGGj43Em: 'created_at',
    },
    calls: {
      fldJPcVfHrXDdd5h2: 'call_id',
      fldce7JXojeTONxY5: 'lead_id',
      fldZCWgZAdmkpCy6Q: 'phone',
      fldaJVlP44bNUVYsK: 'call_outcome',
      fldGgJtbmNqEh9vv6: 'duration_seconds',
      fldkXfQg5FJRbgh9a: 'cost_eur',
      fld123NWL2yHa12Y1: 'main_objection',
      fldS5G3t2H2tdmO3D: 'started_at',
      fld1kEbTjCilbt5zi: 'ended_at',
      fldJD1NpOkJZtKxQP: 'recording_url',
      fld0yyXMZgD42Xx7u: 'summary',
      fldATKjCrxyb7aHFM: 'full_name',
      fldOlBx1erJavJOtR: 'calificacion',
    },
    appointments: {
      fldEen63Bk1HM6Xhi: 'appointment_id',
      fldvRGGLAMFdNfDkm: 'lead_id',
      flduCoP8JXMv9wknb: 'clinic_id',
      fld3q3B11hxhG8nv6: 'appointment_status',
      fldQU8Nilom97dJLH: 'patient_name',
      fldQ3Viw1vHKiBMkL: 'appointment_start',
      fldx1V9Kh8xWaViJQ: 'attendance_status',
      fldOcyUlA41RqNgUn: 'showed_up',
      fldiY9gt8q0jWTegZ: 'created_at',
      fldHANxTYxcrjdjY8: 'phone',
    },
    call_tasks: {
      fldGbpq0zFjNSWzf4: 'task_id',
      fldQZ1p55LhPyC8ya: 'lead_id',
      fld73tQUl4xvyqeTP: 'clinic_id',
      fldS0M84peGoJCdlR: 'phone',
      fldL5incE7OY7NqKJ: 'full_name',
      fldc3F9WBf6sRosaO: 'callback_at',
      fldc1nqJL8LgSKUei: 'task_status',
      fldhaBwIbffqMUSb8: 'attempt_count',
      fldQBiLSOV66Aris5: 'max_attempts',
      fldif2AITDnZde44I: 'callback_reason',
      fld8GG7VJPVwnCypC: 'created_at',
    },
  };
  return maps[tableName];
}

function normalize(records, tableName) {
  const map = fieldMap(tableName);
  return records.map((r) => {
    const row = { _recordId: r.id, _createdTime: r.createdTime };
    const cells = r.fields || {};
    for (const [fid, name] of Object.entries(map)) {
      const raw = cells[fid];
      if (raw && typeof raw === 'object' && 'name' in raw) {
        row[name] = raw.name;
      } else {
        row[name] = raw ?? null;
      }
    }
    return row;
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.AIRTABLE_PAT;
  if (!token) return res.status(500).json({ error: 'AIRTABLE_PAT not configured' });

  try {
    const [rawLeads, rawCalls, rawAppts, rawTasks] = await Promise.all([
      fetchTable(token, 'leads'),
      fetchTable(token, 'calls'),
      fetchTable(token, 'appointments'),
      fetchTable(token, 'call_tasks'),
    ]);

    const data = {
      leads: normalize(rawLeads, 'leads'),
      calls: normalize(rawCalls, 'calls'),
      appointments: normalize(rawAppts, 'appointments'),
      call_tasks: normalize(rawTasks, 'call_tasks'),
      _fetchedAt: new Date().toISOString(),
    };

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Airtable fetch error:', err);
    return res.status(502).json({ error: err.message });
  }
}
