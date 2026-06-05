import { useState } from 'react'
import { useTrmHoy } from '../hooks/useTrm'
import { ArrowLeftRight } from 'lucide-react'

export function Calculadora() {
  const { data } = useTrmHoy()
  const [valor, setValor] = useState('')
  const [modo, setModo] = useState('usd_a_cop') // 'usd_a_cop' | 'cop_a_usd'

  const trm = data?.valor || 0

  const resultado = (() => {
    const n = parseFloat(valor.replace(/,/g, ''))
    if (!n || !trm) return null
    return modo === 'usd_a_cop' ? n * trm : n / trm
  })()

  const fmtCOP = (v) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(v)

  const fmtUSD = (v) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(v)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500">Calculadora</h2>
        <span className="text-xs text-gray-300">TRM: {trm.toLocaleString('es-CO')}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setModo('usd_a_cop')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium ${
            modo === 'usd_a_cop'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          USD → COP
        </button>
        <button
          onClick={() => setModo(m => m === 'usd_a_cop' ? 'cop_a_usd' : 'usd_a_cop')}
          className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200"
        >
          <ArrowLeftRight size={14} />
        </button>
        <button
          onClick={() => setModo('cop_a_usd')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium ${
            modo === 'cop_a_usd'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          COP → USD
        </button>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          {modo === 'usd_a_cop' ? 'USD' : 'COP'}
        </span>
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="0"
          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
        />
      </div>

      {resultado !== null && (
        <div className="mt-3 bg-indigo-50 rounded-xl p-4 text-right">
          <p className="text-xs text-indigo-400 mb-1">
            {modo === 'usd_a_cop' ? 'Equivale en COP' : 'Equivale en USD'}
          </p>
          <p className="text-2xl font-semibold text-indigo-700">
            {modo === 'usd_a_cop' ? fmtCOP(resultado) : fmtUSD(resultado)}
          </p>
        </div>
      )}
    </div>
  )
}
