import { useForex } from '../hooks/useTrm'
import { useTrmHoy } from '../hooks/useTrm'
import { Globe } from 'lucide-react'

const MONEDAS = {
  EUR: { nombre: 'Euro', bandera: '🇪🇺' },
  GBP: { nombre: 'Libra esterlina', bandera: '🇬🇧' },
  CNY: { nombre: 'Renminbi chino', bandera: '🇨🇳' },
  CHF: { nombre: 'Franco suizo', bandera: '🇨🇭' },
  PAB: { nombre: 'Balboa panameño', bandera: '🇵🇦' },
  CAD: { nombre: 'Dólar canadiense', bandera: '🇨🇦' },
  MXN: { nombre: 'Peso mexicano', bandera: '🇲🇽' },
  CLP: { nombre: 'Peso chileno', bandera: '🇨🇱' },
  BRL: { nombre: 'Real brasileño', bandera: '🇧🇷' },
}

export function ForexDivisas({ monedaActiva }) {
  const { data: forex, loading, error } = useForex(null)
  const { data: trmData } = useTrmHoy('USD')

  const trm = trmData?.valor || 0

  const fmtCOP = (v) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(v)

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  )

  const rates = forex?.rates || {}

  const copPorMoneda = (code) => {
    if (code === 'PAB') return trm // 1:1 con USD
    const tasaVsUSD = rates[code]
    if (!tasaVsUSD || !trm) return null
    return trm / tasaVsUSD
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-gray-400" />
        <h2 className="text-sm font-medium text-gray-500">Divisas vs COP</h2>
        <span className="text-xs text-gray-300 ml-auto">{forex?.fecha}</span>
      </div>

      <div className="space-y-1">
        {Object.entries(MONEDAS).map(([code, info]) => {
          const enCOP = copPorMoneda(code)
          if (!enCOP) return null
          const isActive = monedaActiva === code
          return (
            <div
              key={code}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors ${
                isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{info.bandera}</span>
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>{code}</p>
                  <p className="text-xs text-gray-400">{info.nombre}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                {fmtCOP(enCOP)}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-gray-300 text-center">
        Frankfurter API · PAB fijo 1:1 USD
      </p>
    </div>
  )
}
