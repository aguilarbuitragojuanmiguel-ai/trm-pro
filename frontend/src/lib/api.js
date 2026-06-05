const BASE = 'https://trm-pro-api.aguilarbuitragojuanmiguel.workers.dev'

async function get(path) {
  const r = await fetch(`${BASE}${path}`)
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || `Error ${r.status}`)
  }
  return r.json()
}

export const api = {
  trmHoy: () => get('/trm/today'),
  trmFecha: (fecha) => get(`/trm/date?fecha=${fecha}`),
  trmRango: (start, end) => get(`/trm/range?start=${start}&end=${end}`),
  forexHoy: () => get('/forex/today'),
  forexFecha: (fecha) => get(`/forex/date?fecha=${fecha}`),
}
