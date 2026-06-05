import { useTrmHoy } from '../hooks/useTrm'
import { TrendingUp, RefreshCw } from 'lucide-react'

export function TrmHoy() {
  const { data, loading, error } = useTrmHoy()

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
      <div className="h-10 bg-gray-100 rounded w-1/2" />
    </div>
  )

  if (error) return (
    <div className="bg-white rounded-2xl border border-red-100 p-6">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  const fmt = (v) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 2,
  }).format(v)

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="opacity-80" />
          <span className="text-sm font-medium opacity-80">TRM oficial hoy</span>
        </div>
        <span className="text-xs opacity-60 bg-white/10 px-2 py-1 rounded-full">
          {data?.fecha}
        </span>
      </div>
      <p className="text-4xl font-semibold tracking-tight">
        {fmt(data?.valor)}
      </p>
      <p className="text-sm opacity-60 mt-1">por 1 USD</p>
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-1 text-xs opacity-60">
        <RefreshCw size={12} />
        <span>Fuente: {data?.fuente === 'cache' ? 'Caché local' : 'Superfinanciera'}</span>
      </div>
    </div>
  )
}
