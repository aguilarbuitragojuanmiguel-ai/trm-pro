import { useState } from 'react'
import { TrmHoy } from './components/TrmHoy'
import { ConsultaFecha } from './components/ConsultaFecha'
import { GraficaHistorica } from './components/GraficaHistorica'
import { Calculadora } from './components/Calculadora'
import { ForexDivisas } from './components/ForexDivisas'

export default function App() {
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

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrmHoy />
          <ConsultaFecha
            onResult={(fecha, trm) => {
              setFechaSeleccionada(fecha)
              setTrmSeleccionada(trm)
            }}
          />
        </div>
        <GraficaHistorica />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Calculadora fechaExterna={fechaSeleccionada} trmExterna={trmSeleccionada} />
          <ForexDivisas />
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-300">
        Datos: Superfinanciera Colombia · Frankfurter API · TRM Pro v1.1
      </footer>
    </div>
  )
}
