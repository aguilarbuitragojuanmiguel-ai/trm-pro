import { useState } from 'react'
import { TrmHoy } from './components/TrmHoy'
import { ConsultaFecha } from './components/ConsultaFecha'
import { GraficaHistorica } from './components/GraficaHistorica'
import { Calculadora } from './components/Calculadora'
import { ForexDivisas } from './components/ForexDivisas'

const MONEDAS_SELECTOR = [
  { code: 'USD', bandera: '🇺🇸', nombre: 'Dólar americano' },
  { code: 'EUR', bandera: '🇪🇺', nombre: 'Euro' },
  { code: 'GBP', bandera: '🇬🇧', nombre: 'Libra esterlina' },
  { code: 'CNY', bandera: '🇨🇳', nombre: 'Renminbi chino' },
  { code: 'CHF', bandera: '🇨🇭', nombre: 'Franco suizo' },
  { code: 'PAB', bandera: '🇵🇦', nombre: 'Balboa panameño' },
  { code: 'CAD', bandera: '🇨🇦', nombre: 'Dólar canadiense' },
  { code: 'MXN', bandera: '🇲🇽', nombre: 'Peso mexicano' },
  { code: 'CLP', bandera: '🇨🇱', nombre: 'Peso chileno' },
  { code: 'BRL', bandera: '🇧🇷', nombre: 'Real brasileño' },
]

export default function App() {
  const [monedaActiva, setMonedaActiva] = useState('USD')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [trmSeleccionada, setTrmSeleccionada] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">TRM Pro</h1>
              <p className="text-xs text-gray-400">Acta Proyecciones</p>
            </div>
          </div>
          <span className="text-xs text-gray-300">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 whitespace-nowrap mr-1">Ver vs COP:</span>
          {MONEDAS_SELECTOR.map(m => (
            <button
              key={m.code}
              onClick={() => setMonedaActiva(m.code)}
              title={m.nombre}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                monedaActiva === m.code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span>{m.bandera}</span>
              <span>{m.code}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrmHoy moneda={monedaActiva} />
          <ConsultaFecha
            moneda={monedaActiva}
            onResult={(fecha, tasa) => {
              setFechaSeleccionada(fecha)
              setTrmSeleccionada(tasa)
            }}
          />
        </div>
        <GraficaHistorica moneda={monedaActiva} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Calculadora fechaExterna={fechaSeleccionada} trmExterna={trmSeleccionada} monedaBase={monedaActiva} />
          <ForexDivisas monedaActiva={monedaActiva} />
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-300">
        Datos: Superfinanciera Colombia · Frankfurter API · TRM Pro v1.2
      </footer>
    </div>
  )
}
