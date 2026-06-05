import { TrmHoy } from './components/TrmHoy'
import { ConsultaFecha } from './components/ConsultaFecha'
import { GraficaHistorica } from './components/GraficaHistorica'
import { Calculadora } from './components/Calculadora'
import { ForexDivisas } from './components/ForexDivisas'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Fila 1: TRM hoy + Consulta fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrmHoy />
          <ConsultaFecha />
        </div>

        {/* Fila 2: Gráfica historica (full width) */}
        <GraficaHistorica />

        {/* Fila 3: Calculadora + Divisas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Calculadora />
          <ForexDivisas />
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-300">
        Datos: Superfinanciera Colombia · Frankfurter API · TRM Pro v1.0
      </footer>
    </div>
  )
}
