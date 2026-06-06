import { useState, useEffect } from 'react'
import { api } from '../lib/api'
 
// Convierte tasa Frankfurter (1 USD = X moneda) a COP usando TRM
function tasaToCOP(tasaVsUSD, trm) {
  if (!tasaVsUSD || !trm) return null
  return trm / tasaVsUSD
}
 
export function useTrmHoy(moneda = 'USD') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([api.trmHoy(), api.forexHoy()])
      .then(([trm, forex]) => {
        if (moneda === 'USD') {
          setData({ ...trm, moneda: 'USD' })
        } else {
          const tasaVsUSD = forex.rates[moneda]
          const valor = tasaToCOP(tasaVsUSD, trm.valor)
          setData({
            fecha: trm.fecha,
            fechaSolicitada: trm.fechaSolicitada,
            valor,
            esDiaHabil: trm.esDiaHabil,
            moneda,
            fuente: 'Superfinanciera + Frankfurter'
          })
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [moneda])
 
  return { data, loading, error }
}
 
export function useTrmFecha(fecha, moneda = 'USD') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 
  useEffect(() => {
    if (!fecha) return
    setLoading(true)
    setError(null)
    setData(null)
 
    if (moneda === 'USD') {
      api.trmFecha(fecha)
        .then(d => setData({ ...d, moneda: 'USD' }))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else {
      Promise.all([api.trmFecha(fecha), api.forexFecha(fecha)])
        .then(([trm, forex]) => {
          const tasaVsUSD = forex.rates[moneda]
          const valor = tasaToCOP(tasaVsUSD, trm.valor)
          setData({
            fecha: trm.fecha,
            fechaSolicitada: trm.fechaSolicitada,
            valor,
            esDiaHabil: trm.esDiaHabil,
            moneda,
            fuente: 'Superfinanciera + Frankfurter'
          })
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [fecha, moneda])
 
  return { data, loading, error }
}
 
export function useTrmRango(start, end, moneda = 'USD') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 
  const buscar = async () => {
    if (!start || !end) return
    setLoading(true)
    setError(null)
    try {
      if (moneda === 'USD') {
        const result = await api.trmRango(start, end)
        setData(result)
      } else {
        // Jalar TRM base + tasas Frankfurter del rango
        const trmData = await api.trmRango(start, end)
        const trmMap = {}
        trmData.forEach(r => { trmMap[r.fecha] = r.valor })
 
        const url = `https://api.frankfurter.app/${start}..${end}?from=USD&to=${moneda}`
        const r = await fetch(url)
        if (!r.ok) throw new Error(`Frankfurter error: ${r.status}`)
        const forex = await r.json()
 
        const result = Object.entries(forex.rates).map(([fecha, rates]) => {
          // Buscar TRM más cercana
          const trm = trmMap[fecha] || Object.values(trmMap)[0]
          if (!trm || !rates[moneda]) return null
          return { fecha, valor: trm / rates[moneda] }
        }).filter(Boolean)
 
        setData(result)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  return { data, loading, error, buscar }
}
 
export function useForex(fecha) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
  useEffect(() => {
    const fn = fecha ? api.forexFecha(fecha) : api.forexHoy()
    fn.then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [fecha])
 
  return { data, loading, error }
}
