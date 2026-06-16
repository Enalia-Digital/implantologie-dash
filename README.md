# Dashboard Implantologie · Enalia Digital

Dashboard analítico del **Agente Cualificador de Llamadas** para Clínica Dental Implantologie.
Construido con React 18 + Vite + Tailwind CSS + Recharts.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que indique Vite (por defecto http://localhost:5173).

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve el build localmente
```

## Logo

Los logos de Enalia Digital están en `/public`:

- `logo.png` — logo blanco (sidebar, login, cabecera del PDF).
- `favicon.png` — marca "N" violeta (favicon).

Para cambiarlos, sustituye estos archivos manualmente conservando los mismos nombres.

## Datos

Todos los datos son **mock** y viven en:

- `src/data/mockData.js` — métricas por clínica (general, Triana, Los Palacios, San José).
- `src/data/config.js` — tasas base editables (agendamiento, asistencia, fee, etc.).

Están estructurados igual que los registros que llegarán desde **Airtable**.
Pendiente de conectar a backend.

## Acceso (mock)

- `admin@enalia.com` — ve facturación completa (incluye coste de llamadas).
- `cliente@implantologie.com` — facturación sin desglose de costes internos.
- Contraseña: cualquier texto no vacío.

## Deploy

Configurado para Vercel (`vercel.json` con rewrites SPA → `/index.html`).
Output `dist`, build estándar de Vite.
