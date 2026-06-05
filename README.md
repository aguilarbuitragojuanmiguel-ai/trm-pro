# TRM Pro

Dashboard de TRM y divisas — Acta Proyecciones.

## Stack
- **Frontend:** React + Vite + Tailwind CSS → Cloudflare Pages
- **API:** Cloudflare Workers
- **Fuentes:** datos.gov.co (TRM) + frankfurter.app (divisas)

## Estructura
```
trm-pro/
├── worker/          → Cloudflare Worker (API)
│   ├── src/index.js
│   └── wrangler.toml
└── frontend/        → React App (Cloudflare Pages)
    ├── src/
    └── package.json
```

## Rutas del Worker
- `GET /trm/today`
- `GET /trm/date?fecha=YYYY-MM-DD`
- `GET /trm/range?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /forex/today`
- `GET /forex/date?fecha=YYYY-MM-DD`

## Variables de entorno (Worker)
- `CORS_ORIGIN` → URL del frontend en producción (ej: https://trm-pro.pages.dev)

## Variables de entorno (Frontend)
- `VITE_API_URL` → URL del Worker (ej: https://trm-pro-api.TU_USUARIO.workers.dev)
