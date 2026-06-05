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

export function Calculadora({ fechaExterna, trmExterna }) {
  const { data: trmData } = useTrmHoy()
  const { data: forexData } = useForex(null)
  const [valor, setValor] = useState('')
  const [monedaOrigen, setMonedaOrigen] = useState('USD')
  const [monedaDestino, setMonedaDestino] = useState('COP')
  const [showOrigen, setShowOrigen] = useState(false)
  const [showDestino, setShowDestino] = useState(false)

  const trm = trmExterna || trmData?.valor || 0
  const rates = forexData?.rates || {}
  const usandoFechaExterna = !!trmExterna && trmExterna !== trmData?.valor

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
        <span>{value === 'COP' ? '🇨🇴' : MONEDAS[value]?.bandera}</span>
