import { useForex } from '../hooks/useTrm'
import { useTrmHoy } from '../hooks/useTrm'
import { Globe } from 'lucide-react'

const MONEDAS = {
  EUR: { nombre: 'Euro', bandera: '🇪🇺' },
  GBP: { nombre: 'Libra esterlina', bandera: '🇬🇧' },
  JPY: { nombre: 'Yen japonés', bandera: '🇯🇵' },
  CAD: { nombre: 'Dólar canadiense', bandera: '🇨🇦' },
  MXN: { nombre: 'Peso mexicano', bandera: '🇲🇽' },
  CLP: { nombre: 'Peso chileno', bandera: '🇨🇱' },
  BRL: { nombre: 'Real brasileño', bandera: '🇧🇷' },
}

export function ForexDivisas() {
  const { data: forex, loading, error } = useForex(null)
  const { data: trmData } = useTrmHoy()

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

  // Calcular COP por moneda usando TRM como puente: 1 EUR = (1/EUR_USD_rate) USD * TRM
  const copPorMoneda = (codMoneda) => {
    const tasaVsUSD = rates[codMoneda]
    if (!tasaVsUSD || !trm) return null
    // Frankfurter: rates son FROM USD, así que 1 USD = X EUR
    // Para 1 EUR en COP: (1/tasa) * trm
    return (1 / tasaVsUSD) * trm
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-gray-400" />
        <h2 className="text-sm font-medium text-gray-500">Divisas vs COP</h2>
        <span className="text-xs text-gray-300 ml-auto">{forex?.fecha}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(MONEDAS).map(([code, info]) => {
          const enCOP = copPorMoneda(code)
          if (!enCOP) return null
          return (
            <div
              key={code}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{info.bandera}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{code}</p>
                  <p className="text-xs text-gray-400">{info.nombre}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {fmtCOP(enCOP)}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-gray-300 text-center">
        Calculado vía TRM × tipo de cambio USD/{'{'}moneda{'}'} — Frankfurter API
      </p>
    </div>
  )
}
