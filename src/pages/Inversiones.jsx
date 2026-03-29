import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  TrendingUp, Heart, CheckCircle, XCircle, Clock,
  Trophy, Users, DollarSign, BarChart2, PieChart,
  ArrowUpRight, ChevronRight, Megaphone, Calendar,
  AlertCircle, Search,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { inversionesService } from '../services/inversionesService';

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtM  = v => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v||0);
const fmtD  = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—';

const ESTADO_INFO = {
  pendiente:  { label:'Pendiente',  bg:'#FEF9C3', color:'#854D0E', dot:'#F59E0B' },
  confirmado: { label:'Confirmado', bg:'#DCFCE7', color:'#14532D', dot:'#22C55E' },
  rechazado:  { label:'Rechazado',  bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444' },
};

const COLORES_CAMPANA = [
  ['#667EEA','#764BA2'], ['#11998E','#38EF7D'], ['#F093FB','#F5576C'],
  ['#4FACFE','#00F2FE'], ['#43E97B','#38F9D7'], ['#FA709A','#FEE140'],
  ['#A18CD1','#FBC2EB'], ['#0BA360','#3CBA92'],
];
const getClr = id => COLORES_CAMPANA[(id||0)%COLORES_CAMPANA.length];

// ─── Mini gráfica de barras (SVG nativo) ─────────────────────────────────────
const BarChart = ({ data, color='#3B82F6', height=80 }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d=>d.value), 1);
  const W = 100, H = height, pad = 4;
  const bw = (W - pad*(data.length+1)) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H+20}`} style={{width:'100%',overflow:'visible'}}>
      {data.map((d,i) => {
        const bh = Math.max(2, (d.value/max)*(H-8));
        const x  = pad + i*(bw+pad);
        const y  = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={color} opacity="0.85"/>
            <text x={x+bw/2} y={H+14} textAnchor="middle" fontSize="7" fill="#9CA3AF" fontFamily="DM Sans,sans-serif">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Donut SVG nativo ─────────────────────────────────────────────────────────
const DonutChart = ({ slices, size=120 }) => {
  const r   = 40, cx=60, cy=60, stroke=14;
  const circ = 2*Math.PI*r;
  const total = slices.reduce((a,s)=>a+s.value,0)||1;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke}/>
      {slices.filter(s=>s.value>0).map((s,i) => {
        const dash = (s.value/total)*circ;
        const gap  = circ - dash;
        const el   = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="13" fontWeight="800" fill="#111827" fontFamily="Plus Jakarta Sans,sans-serif">
        {slices.length}
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="DM Sans,sans-serif">
        campañas
      </text>
    </svg>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon:Icon, label, value, sub, color, gradient }) => (
  <div style={{padding:'18px 20px',borderRadius:'16px',background:gradient||'#fff',border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.05)',display:'flex',flexDirection:'column',gap:'6px'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{width:'38px',height:'38px',borderRadius:'10px',background:color+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon style={{width:'18px',height:'18px',color}}/>
      </div>
      <ArrowUpRight style={{width:'14px',height:'14px',color:'var(--gray-300)'}}/>
    </div>
    <div style={{fontSize:'24px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1}}>{value}</div>
    <div style={{fontSize:'12px',fontWeight:600,color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
    {sub&&<div style={{fontSize:'11px',color,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{sub}</div>}
  </div>
);

// ─── Fila de inversión en la tabla ────────────────────────────────────────────
const InvRow = ({ inv, hov, setHov }) => {
  const campana = inv.campana;
  const [c1,c2] = getClr(campana?.id);
  const ini = `${inv.inversor?.nombre?.[0]||''}${inv.inversor?.apellido?.[0]||''}`.toUpperCase();
  const info = ESTADO_INFO[inv.estadoPago]||ESTADO_INFO.pendiente;

  return (
    <tr onMouseEnter={()=>setHov(inv.id)} onMouseLeave={()=>setHov(null)}
      style={{borderBottom:'1px solid var(--border)',background:hov===inv.id?'var(--gray-50)':'#fff',transition:'background 120ms',opacity:inv.activo?1:.5}}>

      {/* Inversor */}
      <td style={{padding:'12px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'34px',height:'34px',borderRadius:'10px',flexShrink:0,background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{ini}</div>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif"}}>{inv.inversor?.nombre} {inv.inversor?.apellido}</div>
            <div style={{fontSize:'10px',color:'var(--gray-400)',fontFamily:"'JetBrains Mono',monospace"}}>{inv.referencia}</div>
          </div>
        </div>
      </td>

      {/* Campaña */}
      <td style={{padding:'12px 16px'}}>
        <div style={{fontSize:'13px',fontWeight:600,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif",maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{campana?.titulo}</div>
        <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{campana?.negocio?.nombreNegocio}</div>
      </td>

      {/* Monto */}
      <td style={{padding:'12px 16px'}}>
        <div style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(inv.monto)}</div>
      </td>

      {/* Estado */}
      <td style={{padding:'12px 16px'}}>
        <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:700,background:info.bg,color:info.color,fontFamily:"'DM Sans',sans-serif",display:'inline-flex',alignItems:'center',gap:'4px'}}>
          <span style={{width:'6px',height:'6px',borderRadius:'50%',background:info.dot,flexShrink:0}}/>{info.label}
        </span>
      </td>

      {/* Fecha */}
      <td style={{padding:'12px 16px'}}>
        <div style={{fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>{fmtD(inv.fechaCreacion)}</div>
        {inv.fechaConfirmacion&&<div style={{fontSize:'11px',color:'#10B981',fontFamily:"'DM Sans',sans-serif"}}>✓ {fmtD(inv.fechaConfirmacion)}</div>}
      </td>
    </tr>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const Inversiones = () => {
  const [inversiones, setInversiones] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filtroEstado,setFiltroEst]   = useState('');
  const [hovRow,      setHovRow]      = useState(null);

  useEffect(()=>{ cargarDatos(); },[]);

  const cargarDatos = async()=>{
    setLoading(true);
    try {
      const res = await inversionesService.getAll();
      setInversiones(res.data||[]);
    } catch { toast.error('Error al cargar inversiones'); }
    finally { setLoading(false); }
  };

  // ── Métricas ──
  const confirmadas = inversiones.filter(i=>i.estadoPago==='confirmado'&&i.activo);
  const pendientes  = inversiones.filter(i=>i.estadoPago==='pendiente'&&i.activo);
  const totalInvertido  = confirmadas.reduce((a,i)=>a+parseFloat(i.monto||0),0);
  const promedioInv     = confirmadas.length ? totalInvertido/confirmadas.length : 0;
  const campanasUnicas  = new Set(confirmadas.map(i=>i.campanaId)).size;

  // Distribución por campaña (top 6) para donut
  const porCampana = Object.values(
    confirmadas.reduce((acc,i)=>{
      const k = i.campanaId;
      if(!acc[k]) acc[k]={ id:k, titulo:i.campana?.titulo||'Sin nombre', monto:0, count:0 };
      acc[k].monto += parseFloat(i.monto||0);
      acc[k].count += 1;
      return acc;
    },{})
  ).sort((a,b)=>b.monto-a.monto).slice(0,6);

  const donutSlices = porCampana.map((c)=>({
    color: getClr(c.id)[0],
    value: c.monto,
    label: c.titulo,
  }));

  // Evolución mensual (últimos 6 meses)
  const mesesData = (() => {
    const meses = [];
    for(let i=5;i>=0;i--){
      const d = new Date(); d.setMonth(d.getMonth()-i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('es-MX',{month:'short'});
      const value = confirmadas
        .filter(inv=>{ const f=new Date(inv.fechaCreacion); return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}`===key; })
        .reduce((a,inv)=>a+parseFloat(inv.monto||0),0);
      meses.push({label,value,key});
    }
    return meses;
  })();

  // Filtro tabla
  const invFiltradas = inversiones.filter(i=>{
    const ms = !search || i.referencia?.toLowerCase().includes(search.toLowerCase()) ||
      i.inversor?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      i.campana?.titulo?.toLowerCase().includes(search.toLowerCase());
    const mf = !filtroEstado || i.estadoPago===filtroEstado;
    return ms&&mf;
  });

  if(loading) return(
    <Layout><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid var(--gray-200)',borderTopColor:'var(--capyme-blue-mid)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div></Layout>
  );

  return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{padding:'32px 24px',maxWidth:'1280px',margin:'0 auto',animation:'fadeUp .4s ease'}}>

        {/* Header */}
        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontSize:'28px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px'}}>
            Dashboard de inversiones
          </h1>
          <p style={{fontSize:'14px',color:'var(--gray-500)',margin:0,fontFamily:"'DM Sans',sans-serif"}}>
            Seguimiento de todas las aportaciones en la plataforma
          </p>
        </div>

        {/* Stat cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'28px'}}>
          <StatCard icon={DollarSign}  label="Total invertido"   value={fmtM(totalInvertido)}  color="#10B981"  sub={`${confirmadas.length} confirmadas`}/>
          <StatCard icon={Clock}       label="Pendientes"        value={pendientes.length}       color="#F59E0B"  sub="Por confirmar"/>
          <StatCard icon={TrendingUp}  label="Promedio inversión" value={fmtM(promedioInv)}     color="var(--capyme-blue-mid)" sub="por operación"/>
          <StatCard icon={Megaphone}   label="Campañas apoyadas" value={campanasUnicas}          color="#8B5CF6"  sub="únicas"/>
          <StatCard icon={Users}       label="Total inversiones"  value={inversiones.length}     color="#059669"  sub={`${pendientes.length} pendientes`}/>
        </div>

        {/* Gráficas */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'28px'}}>

          {/* Evolución mensual */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <div>
                <h3 style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 2px'}}>Inversiones por mes</h3>
                <p style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Últimos 6 meses (monto confirmado)</p>
              </div>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#EEF4FF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <BarChart2 style={{width:'15px',height:'15px',color:'var(--capyme-blue-mid)'}}/>
              </div>
            </div>
            {mesesData.every(m=>m.value===0) ? (
              <div style={{height:'80px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--gray-300)',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"}}>Sin datos aún</div>
            ) : (
              <BarChart data={mesesData} color="var(--capyme-blue-mid)" height={80}/>
            )}
            <div style={{display:'flex',gap:'6px',marginTop:'12px',flexWrap:'wrap'}}>
              {mesesData.map((m,i)=>m.value>0&&(
                <div key={i} style={{fontSize:'10px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",background:'var(--gray-50)',padding:'2px 8px',borderRadius:'6px'}}>
                  {m.label}: {fmtM(m.value)}
                </div>
              ))}
            </div>
          </div>

          {/* Distribución por campaña */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <div>
                <h3 style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 2px'}}>Distribución por campaña</h3>
                <p style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Top campañas por monto recibido</p>
              </div>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <PieChart style={{width:'15px',height:'15px',color:'#8B5CF6'}}/>
              </div>
            </div>
            {porCampana.length===0 ? (
              <div style={{height:'80px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--gray-300)',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"}}>Sin datos aún</div>
            ) : (
              <div style={{display:'flex',gap:'20px',alignItems:'center'}}>
                <DonutChart slices={donutSlices} size={110}/>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:'7px',overflow:'hidden'}}>
                  {porCampana.map((c)=>(
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{width:'10px',height:'10px',borderRadius:'50%',background:getClr(c.id)[0],flexShrink:0}}/>
                      <span style={{fontSize:'12px',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.titulo}</span>
                      <span style={{fontSize:'11px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>{fmtM(c.monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de inversiones */}
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
          {/* Header de tabla */}
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
            <h3 style={{fontSize:'15px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0,flex:1}}>
              Historial de inversiones
            </h3>
            {/* Buscador */}
            <div style={{position:'relative',width:'220px'}}>
              <Search style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--gray-400)'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{width:'100%',padding:'8px 10px 8px 30px',border:'1.5px solid var(--border)',borderRadius:'8px',fontSize:'13px',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
            </div>
            {/* Filtro estado */}
            <div style={{display:'flex',gap:'5px'}}>
              {[{v:'',l:'Todas'},{v:'pendiente',l:'Pendientes'},{v:'confirmado',l:'Confirmadas'},{v:'rechazado',l:'Rechazadas'}].map(({v,l})=>(
                <button key={v} onClick={()=>setFiltroEst(v)} style={{padding:'6px 12px',borderRadius:'99px',border:filtroEstado===v?'none':'1.5px solid var(--border)',background:filtroEstado===v?'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)':'#fff',color:filtroEstado===v?'#fff':'var(--gray-600)',fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 150ms'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {invFiltradas.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'var(--gray-400)'}}>
              <TrendingUp style={{width:'40px',height:'40px',margin:'0 auto 12px',display:'block',color:'var(--gray-200)'}}/>
              <p style={{fontSize:'14px',fontFamily:"'DM Sans',sans-serif",margin:0}}>No hay inversiones{search?' con esa búsqueda':''}</p>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'var(--gray-50)',borderBottom:'1px solid var(--border)'}}>
                    {['Inversor','Campaña','Monto','Estado','Fecha'].map(h=>(
                      <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:'.05em',fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invFiltradas.map(inv=>(
                    <InvRow key={inv.id} inv={inv} hov={hovRow} setHov={setHovRow}/>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer con totales */}
          {invFiltradas.length>0&&(
            <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',background:'var(--gray-50)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'12px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{invFiltradas.length} resultado{invFiltradas.length!==1?'s':''}</span>
              <span style={{fontSize:'13px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Total mostrado: {fmtM(invFiltradas.filter(i=>i.estadoPago==='confirmado'&&i.activo).reduce((a,i)=>a+parseFloat(i.monto||0),0))}
              </span>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Inversiones;