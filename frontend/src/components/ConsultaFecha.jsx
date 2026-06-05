import { useState } from 'react'
import { useTrmFecha } from '../hooks/useTrm'
import { Search } from 'lucide-react'

export function ConsultaFecha() {
  const [input, setInput] = useState('')
  const [fecha, setFecha] = useState(null)
  const { data, loading, error } = useTrmFecha(fecha)

  const buscar = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) setFecha(input)
  }

  const fmt = (v) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 2,
  }).format(v)

  const esFinDeSemana = data && data.fecha !== data.fechaSolicitada

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-sm font-medium text-gray-500 mb-4">Consulta por fecha</h2>
      <div className="flex gap-2">
        <input
          type="date"
          value={input}
          onChange={e => setInput(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={buscar}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Search size={14} />
          Buscar
        </button>
      </div>

      {loading && <div className="mt-4 animate-pulse h-8 bg-gray-100 rounded-lg" />}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {data && !loading && (
        <div className="mt-4 bg-indigo-50 rounded-xl p-4">
          <p className="text-xs text-indigo-400 mb-1">{data.fechaSolicitada || data.fecha}</p>
          <p className="text-2xl font-semibold text-indigo-700">{fmt(data.valor)}</p>
          <p className="text-xs text-indigo-400 mt-1">por 1 USD</p>
          {esFinDeSemana && (
            <p className="text-xs text-indigo-300 mt-2">
              📅 Fin de semana / festivo — TRM vigente del {data.fecha}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
