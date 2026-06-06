// TRM PRO — Cloudflare Worker
const DATOS_GOV_URL = 'https://www.datos.gov.co/resource/32sa-8pi3.json';
const FRANKFURTER_URL = 'https://api.frankfurter.app';
const MONEDAS_EXTRA = ['EUR', 'GBP', 'CNY', 'CAD', 'MXN', 'CLP', 'BRL'];
 
// ── datos.gov.co ──────────────────────────────────────────────────────────────
 
async function fetchTrmFromGov(fecha) {
  const url = `${DATOS_GOV_URL}?vigenciadesde=${fecha}T00:00:00.000`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`datos.gov.co error: ${r.status}`);
  const data = await r.json();
  if (!data.length) return null;
  return parseFloat(data[0].valor);
}
 
// Busca TRM hacia atrás hasta 7 días para cubrir fines de semana y festivos
async function fetchTrmConFallback(fecha) {
  let d = new Date(fecha + 'T12:00:00Z');
  for (let i = 0; i < 7; i++) {
    const f = d.toISOString().slice(0, 10);
    const valor = await fetchTrmFromGov(f);
    if (valor) return { fecha: f, valor, esDiaHabil: i === 0 };
    d.setDate(d.getDate() - 1);
  }
  return null;
}
 
async function fetchTrmRangeFromGov(start, end) {
  const url = `${DATOS_GOV_URL}?$where=vigenciadesde>='${start}T00:00:00.000' AND vigenciahasta<='${end}T23:59:59.000'&$limit=200&$order=vigenciadesde ASC`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`datos.gov.co error: ${r.status}`);
  return r.json();
}
 
// ── Frankfurter ───────────────────────────────────────────────────────────────
 
async function fetchForex(fecha) {
  const esHoy = fecha === hoy();
  const url = esHoy
    ? `${FRANKFURTER_URL}/latest?from=USD`
    : `${FRANKFURTER_URL}/${fecha}?from=USD`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Frankfurter error: ${r.status}`);
  const data = await r.json();
  return data.rates || {};
}
 
// ── Utils ─────────────────────────────────────────────────────────────────────
 
function hoy() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Bogota' }).slice(0, 10);
}
 
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
 
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
 
function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
 
// ── Handlers ──────────────────────────────────────────────────────────────────
 
async function handleTrmToday() {
  const fecha = hoy();
  const result = await fetchTrmConFallback(fecha);
  if (!result) return json({ error: 'TRM no disponible. Intenta más tarde.' }, 404);
  return json({
    fecha: result.fecha,
    fechaSolicitada: fecha,
    valor: result.valor,
    esDiaHabil: result.esDiaHabil,
    fuente: 'Superfinanciera / datos.gov.co'
  });
}
 
async function handleTrmDate(url) {
  const fecha = url.searchParams.get('fecha');
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return json({ error: 'Parámetro fecha requerido: YYYY-MM-DD' }, 400);
  const result = await fetchTrmConFallback(fecha);
  if (!result) return json({ error: `TRM no encontrada para ${fecha}.` }, 404);
  return json({
    fecha: result.fecha,
    fechaSolicitada: fecha,
    valor: result.valor,
    esDiaHabil: result.esDiaHabil,
    fuente: 'Superfinanciera / datos.gov.co'
  });
}
 
async function handleTrmRange(url) {
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  if (!start || !end) return json({ error: 'Parámetros start y end requeridos (YYYY-MM-DD)' }, 400);
  const raw = await fetchTrmRangeFromGov(start, end);
  const result = raw.map(r => ({
    fecha: r.vigenciadesde.slice(0, 10),
    valor: parseFloat(r.valor),
  }));
  return json(result);
}
 
async function handleForex(fecha) {
  if (!fecha) fecha = hoy();
  const rates = await fetchForex(fecha);
  const filtered = {};
  MONEDAS_EXTRA.forEach(m => { if (rates[m]) filtered[m] = rates[m]; });
  return json({ fecha, base: 'USD', rates: filtered, fuente: 'frankfurter.app' });
}
 
// ── Router ────────────────────────────────────────────────────────────────────
 
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
 
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: corsHeaders() });
 
    let response;
    try {
      if (path === '/trm/today')         response = await handleTrmToday();
      else if (path === '/trm/date')     response = await handleTrmDate(url);
      else if (path === '/trm/range')    response = await handleTrmRange(url);
      else if (path === '/forex/today')  response = await handleForex(null);
      else if (path === '/forex/date')   response = await handleForex(url.searchParams.get('fecha'));
      else response = json({ error: 'Ruta no encontrada' }, 404);
    } catch (err) {
      response = json({ error: err.message }, 500);
    }
 
    return withCors(response);
  },
};
