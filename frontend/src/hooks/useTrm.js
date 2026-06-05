import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function useTrmHoy() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.trmHoy()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useTrmFecha(fecha) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!fecha) return
    setLoading(true)
    setError(null)
    api.trmFecha(fecha)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [fecha])

  return { data, loading, error }
}

export function useTrmRango(start, end) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const buscar = async () => {
    if (!start || !end) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.trmRango(start, end)
      setData(result)
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
