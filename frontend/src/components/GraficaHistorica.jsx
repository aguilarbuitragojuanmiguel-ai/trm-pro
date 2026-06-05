import { useState } from 'react'
import { useTrmRango } from '../hooks/useTrm'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { BarChart2, Download } from 'lucide-react'

const RANGOS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '6M', days: 180 },
]

function getRange(days) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function exportExcel(data, start, end) {
  const BOM = '\uFEFF'
  const esc = (v) => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const estiloHeader = 's="1"'
  const estiloNum = 's="2"'

  const filas = data.map((r, i) => {
    const prev = data[i - 1]
    const variacion = prev ? (r.valor - prev.valor).toFixed(2) : ''
    const pct = prev ? (((r.valor - prev.valor) / prev.valor) * 100).toFixed(4) + '%' : ''
    const fecha = new Date(r.fecha + 'T12:00:00')
    const fechaFmt = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const diaSemana = fecha.toLocaleDateString('es-CO', { weekday: 'long' })
    return `<Row>
      <Cell><Data ss:Type="String">${esc(fechaFmt)}</Data></Cell>
      <Cell><Data ss:Type="String">${esc(diaSemana)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.valor.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="${variacion ? 'Number' : 'String'}">${esc(variacion)}</Data></Cell>
      <Cell><Data ss:Type="String">${esc(pct)}</Data></Cell>
    </Row>`
  }).join('\n')

  const promedioVal = data.reduce((a, r) => a + r.valor, 0) / data.length
  const minVal = Math.min(...data.map(r => r.valor))
  const maxVal = Math.max(...data.map(r => r.valor))
  const variacionTotal = (data[data.length-1]?.valor - data[0]?.valor).toFixed(2)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="1"><Font ss:Bold="1"/></Style>
    <Style ss:ID="2"><NumberFormat ss:Format="#,##0.00"/></Style>
  </Styles>
  <Worksheet ss:Name="TRM Historico">
    <Table>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">TRM PRO</Data></Cell><Cell><Data ss:Type="String">Historico USD/COP</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Generado</Data></Cell><Cell><Data ss:Type="String">${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Rango</Data></Cell><Cell><Data ss:Type="String">${start} al ${end}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Registros</Data></Cell><Cell><Data ss:Type="Number">${data.length}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Fuente</Data></Cell><Cell><Data ss:Type="String">Superfinanciera de Colombia / datos.gov.co</Data></Cell></Row>
      <Row></Row>
      <Row>
        <Cell ${estiloHeader}><Data ss:Type="String">Fecha</Data></Cell>
        <Cell ${estiloHeader}><Data ss:Type="String">Dia</Data></Cell>
        <Cell ${estiloHeader}><Data ss:Type="String">TRM (COP x 1 USD)</Data></Cell>
        <Cell ${estiloHeader}><Data ss:Type="String">Variacion</Data></Cell>
        <Cell ${estiloHeader}><Data ss:Type="String">% Cambio</Data></Cell>
      </Row>
      ${filas}
      <Row></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">RESUMEN</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Promedio</Data></Cell><Cell ${estiloNum}><Data ss:Type="Number">${promedioVal.toFixed(2)}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Minimo</Data></Cell><Cell ${estiloNum}><Data ss:Type="Number">${minVal.toFixed(2)}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Maximo</Data></Cell><Cell ${estiloNum}><Data ss:Type="Number">${maxVal.toFixed(2)}</Data></Cell></Row>
      <Row><Cell ${estiloHeader}><Data ss:Type="String">Variacion total</Data></Cell><Cell ${estiloNum}><Data ss:Type="Number">${variacionTotal}</Data></Cell></Row>
    </Table>
  </Worksheet>
</Workbook>`

  const blob = new Blob([BOM + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `TRM-PRO_${start}_${end}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2">
      <p className="text-xs text-gray-400">{payload[0].payload.fechaFull}</p>
      <p className="text-sm font-semibold text-indigo-700">
        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(payload[0].value)}
      </p>
    </div>
  )
}

export function GraficaHistorica() {
  const [rangoActivo, setRangoActivo] = useState(1)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [cargado, setCargado] = useState(false)

  const rangoPreset = getRange(RANGOS[rangoActivo].days)
  const start = useCustom ? customStart : rangoPreset.start
  const end = useCustom ? customEnd : rangoPreset.end

  const { data, loading, error, buscar } = useTrmRango(start, end)

  const cargar = () => { buscar(); setCargado(true) }

  const selectPreset = (i) => {
    setRangoActivo(i)
    setUseCustom(false)
    setCargado(false)
  }

  const promedio = data.length ? data.reduce((a, r) => a + parseFloat(r.valor), 0) / data.length : 0
  const minVal = data.length ? Math.min(...data.map(r => parseFloat(r.valor))) : 0
  const maxVal = data.length ? Math.max(...data.map(r => parseFloat(r.valor))) : 0

  const chartData = data.map(r => ({
    ...r,
    valor: parseFloat(r.valor),
    fechaFull: new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }),
    fecha: r.fecha.slice(5),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-gray-400" />
          <h2 className="text-sm font-medium text-gray-500">Historico TRM</h2>
        </div>
        {data.length > 0 && (
          <button
            onClick={() => exportExcel(data, start, end)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-100 px-2.5 py-1.5 rounded-lg"
          >
            <Download size={12} />
            Exportar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {RANGOS.map((r, i) => (
          <button
            key={r.label}
            onClick={() => selectPreset(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !useCustom && rangoActivo === i
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {r.label}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <span className="text-gray-300 text-xs">→</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <button onClick={() => { setUseCustom(true); cargar() }}
            className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs">Ir</button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Minimo', value: minVal, color: 'text-green-600' },
            { label: 'Promedio', value: promedio, color: 'text-indigo-600' },
            { label: 'Maximo', value: maxVal, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-sm font-semibold ${s.color}`}>
                {new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(s.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !cargado && (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <p className="text-gray-300 text-sm">Selecciona un rango y carga los datos</p>
          <button onClick={cargar} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700">
            Cargar datos
          </button>
        </div>
      )}

      {!loading && cargado && data.length === 0 && (
        <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
          Sin datos para este rango
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => v.toLocaleString('es-CO')} domain={['auto', 'auto']} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={promedio} stroke="#e0e7ff" strokeDasharray="4 4"
                label={{ value: 'Prom', fill: '#a5b4fc', fontSize: 10 }} />
              <Line type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: '#4f46e5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
