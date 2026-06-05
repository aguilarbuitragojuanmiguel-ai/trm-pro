import { useState } from 'react'
import { useForex } from '../hooks/useTrm'
import { useTrmHoy } from '../hooks/useTrm'
import { ArrowLeftRight } from 'lucide-react'

const MONEDAS = {
  USD: { nombre: 'Dólar americano', bandera: '🇺🇸', decimales: 2 },
  EUR: { nombre: 'Euro', bandera: '🇪🇺', decimales: 2 },
  GBP: { nombre: 'Libra esterlina', bandera: '🇬🇧', decimales: 2 },
  JPY: { nombre: 'Yen japonés', bandera: '🇯🇵', decimales: 0 },
  CAD: { nombre: 'Dólar canadiense', bandera: '🇨🇦', decimales: 2 },
  MXN: { nombre: 'Peso mexicano', bandera: '🇲🇽', decimales: 2 },
  CLP: { nombre: 'Peso chileno', bandera: '🇨🇱', decimales: 0 },
  BRL: { nombre: 'Real brasileño', bandera: '🇧🇷', decimales: 2 },
}

export function Calculadora() {
  const { data: trmData } = useTrmHoy()
  const { data: forexData } = useForex(null)
  const [valor, setValor] = useState('')
  const [monedaOrigen, setMonedaOrigen] = useState('USD')
  const [monedaDestino, setMonedaDestino] = useState('COP')
  const [showOrigen, setShowOrigen] = useState(false)
  const [showDestino, setShowDestino] = useState(false)

  const trm = trmData?.valor || 0
  const rates = forexData?.rates || {}

  function toCOP(monto, moneda) {
    if (moneda === 'COP') return monto
    if (moneda === 'USD') return monto * trm
    const tasaVsUSD = rates[moneda]
    if (!tasaVsUSD) return null
    return (monto / tasaVsUSD) * trm
  }

  function fromCOP(monto, moneda) {
    if (moneda === 'COP') return monto
    if (moneda === 'USD') return monto / trm
    const tasaVsUSD = rates[moneda]
    if (!tasaVsUSD) return null
    return (monto / trm) * tasaVsUSD
  }

  const resultado = (() => {
    const n = parseFloat(valor)
    if (!n || !trm) return null
    const enCOP = toCOP(n, monedaOrigen)
    if (!enCOP) return null
    if (monedaDestino === 'COP') return enCOP
    return fromCOP(enCOP, monedaDestino)
  })()

  const fmt = (v, moneda) => {
    if (moneda === 'COP') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
    const dec = MONEDAS[moneda]?.decimales ?? 2
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v) + ' ' + moneda
  }

  const swap = () => {
    setMonedaOrigen(monedaDestino)
    setMonedaDestino(monedaOrigen)
    setValor('')
  }

  const SelectMoneda = ({ value, onChange, show, setShow, exclude }) => (
    <div className="relative">
      <button
        onClick={() => setShow(s => !s)}
        className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:bg-gray-50 min-w-[110px]"
      >
        <span>{MONEDAS[value]?.bandera || '🇨🇴'}</span>
        <span className="font-medium">{value}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-[180px]">
          <div
            onClick={() => { onChange('COP'); setShow(false) }}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-t-xl text-sm ${value === 'COP' ? 'bg-indigo-50 text-indigo-700' : ''}`}
          >
            <span>🇨🇴</span><span className="font-medium">COP</span><span className="text-gray-400 text-xs ml-1">Peso colombiano</span>
          </div>
          {Object.entries(MONEDAS).filter(([k]) => k !== exclude).map(([code, info]) => (
            <div
              key={code}
              onClick={() => { onChange(code); setShow(false) }}
              className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm last:rounded-b-xl ${value === code ? 'bg-indigo-50 text-indigo-700' : ''}`}
            >
              <span>{info.bandera}</span>
              <span className="font-medium">{code}</span>
              <span className="text-gray-400 text-xs ml-1">{info.nombre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500">Calculadora</h2>
        <span className="text-xs text-gray-300">TRM: {trm.toLocaleString('es-CO')}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <SelectMoneda value={monedaOrigen} onChange={setMonedaOrigen} show={showOrigen} setShow={setShowOrigen} exclude={monedaDestino} />
        <button onClick={swap} className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 flex-shrink-0">
          <ArrowLeftRight size={14} />
        </button>
        <SelectMoneda value={monedaDestino} onChange={setMonedaDestino} show={showDestino} setShow={setShowDestino} exclude={monedaOrigen} />
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
          {monedaOrigen}
        </span>
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="0"
          className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
        />
      </div>

      {resultado !== null && (
        <div className="mt-3 bg-indigo-50 rounded-xl p-4 text-right">
          <p className="text-xs text-indigo-400 mb-1">
            {valor} {monedaOrigen} equivale en {monedaDestino}
          </p>
          <p className="text-2xl font-semibold text-indigo-700">
            {fmt(resultado, monedaDestino)}
          </p>
        </div>
      )}
    </div>
  )
}
