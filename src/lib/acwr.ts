export interface TrainingLog { fecha: string; carga_ua: number }
export interface ACWRResult { ratio: number; acuteLoad: number; chronicLoad: number; status: string; label: string; color: string }

export function calcACWR(logs: TrainingLog[], ref = new Date()): ACWRResult {
  const acute   = logs.filter(l => { const d=(ref.getTime()-new Date(l.fecha).getTime())/86400000; return d>=0&&d<7 })
  const chronic = logs.filter(l => { const d=(ref.getTime()-new Date(l.fecha).getTime())/86400000; return d>=0&&d<28 })
  const aLoad = acute.reduce((s,l)=>s+Number(l.carga_ua),0)/7
  const cLoad = chronic.reduce((s,l)=>s+Number(l.carga_ua),0)/28
  if (!cLoad) return { ratio:0, acuteLoad:0, chronicLoad:0, status:'sin_datos', label:'Sin datos', color:'#888' }
  const ratio = parseFloat((aLoad/cLoad).toFixed(3))
  if (ratio>=0.8&&ratio<=1.3) return { ratio, acuteLoad:Math.round(aLoad), chronicLoad:Math.round(cLoad), status:'optimo', label:'Estado Óptimo', color:'#22c55e' }
  if (ratio>1.3&&ratio<=1.5) return { ratio, acuteLoad:Math.round(aLoad), chronicLoad:Math.round(cLoad), status:'precaucion', label:'Precaución', color:'#f59e0b' }
  return { ratio, acuteLoad:Math.round(aLoad), chronicLoad:Math.round(cLoad), status:'peligro', label:'Riesgo', color:'#ef4444' }
}

export function buildACWRHistory(logs: TrainingLog[], days=28) {
  return Array.from({length:days},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(days-1-i))
    const {ratio,status}=calcACWR(logs,d)
    const s=d.toISOString().split('T')[0]
    return { date:s, label:s.slice(5), ratio, status }
  })
}
