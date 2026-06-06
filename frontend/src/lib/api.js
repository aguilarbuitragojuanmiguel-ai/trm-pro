const BASE = 'https://trm-pro-api.aguilarbuitragojuanmiguel.workers.dev'
 
async function get(path) {
  const r = await fetch(`${BASE}${path}`)
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || `Error ${r.status}`)
  }
  return r.json()
}
 
// Frankfurter: histórico de cualquier par vs COP usando USD como puente
// Retorna array [{fecha, valor}] donde valor es tasa de `moneda` en COP
async function fetchForexHistorico(moneda, start, end, trmMap) {
  if (moneda === 'USD') return null // USD ya lo maneja el worker
  const url = `https://api.frankfurter.app/${start}..${end}?from=USD&to=${moneda}`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Frankfurter error: ${r.status}`)
  const data = await r.json()
  // data.rates = { "2026-01-01": { "EUR": 0.95 }, ... }
  return Object.entries(data.rates).map(([fecha, rates]) => ({
    fecha,
    valor: trmMap[fecha] ? (trmMap[fecha] / rates[moneda]) : null
  })).filter(r => r.valor !== null)
}
 
export const api = {
  trmHoy: () => get('/trm/today'),
  trmFecha: (fecha) => get(`/trm/date?fecha=${fecha}`),
  trmRango: (start, end) => get(`/trm/range?start=${start}&end=${end}`),
  forexHoy: () => get('/forex/today'),
  forexFecha: (fecha) => get(`/forex/date?fecha=${fecha}`),
  forexHistorico: fetchForexHistorico,
}
 
