import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Heart, TrendingUp, DollarSign, Trophy, Clock,
  Megaphone, Gift, Percent, ChevronRight,
  ArrowUpRight, Sparkles, AlertCircle, BarChart2,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { inversionesService } from '../services/inversionesService';

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtM  = v => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v||0);
const fmtD  = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const getPct= (r,m) => (!m||!parseFloat(m)) ? 0 : Math.min(100,Math.round((parseFloat(r)/parseFloat(m))*100));
const isMeta= c => parseFloat(c?.metaRecaudacion||0)>0 && parseFloat(c?.montoRecaudado||0)>=parseFloat(c?.metaRecaudacion||1);

const COLORES = [
  ['#667EEA','#764BA2'], ['#11998E','#38EF7D'], ['#F093FB','#F5576C'],
  ['#4FACFE','#00F2FE'], ['#43E97B','#38F9D7'], ['#FA709A','#FEE140'],
  ['#A18CD1','#FBC2EB'], ['#0BA360','#3CBA92'],
];
const getClr = id => COLORES[(id||0)%COLORES.length];

const ESTADO_PAGO = {
  pendiente:  { label:'Pendiente',  bg:'#FEF9C3', color:'#854D0E', dot:'#F59E0B', icon:Clock },
  confirmado: { label:'Confirmado', bg:'#DCFCE7', color:'#14532D', dot:'#22C55E', icon:Trophy },
  rechazado:  { label:'Rechazado',  bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444', icon:Heart },
};

const TIPO_INFO = {
  reward:  { label:'Recompensa', icon:Gift,    color:'#F59E0B', bg:'#FEF9C3' },
  lending: { label:'Préstamo',   icon:Percent, color:'#8B5CF6', bg:'#F5F3FF' },
};

// ─── Mini donut ───────────────────────────────────────────────────────────────
const MiniDonut = ({ pct, color1, color2, size=64 }) => {
  const r=24, cx=32, cy=32, stroke=6;
  const circ=2*Math.PI*r;
  const dash=(pct/100)*circ;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#g${Math.round(pct)})`} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
        style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
      <defs>
        <linearGradient id={`g${Math.round(pct)}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1}/>
          <stop offset="100%" stopColor={color2}/>
        </linearGradient>
      </defs>
      <text x={cx} y={cy+5} textAnchor="middle" fontSize="12" fontWeight="800" fill="#111827" fontFamily="Plus Jakarta Sans,sans-serif">{pct}%</text>
    </svg>
  );
};

// ─── Card de inversión ────────────────────────────────────────────────────────
const InvCard = ({ inv, onVerCampana }) => {
  const [hov, setHov] = useState(false);
  const campana=inv.campana;
  const [c1,c2]=getClr(campana?.id);
  const estadoInfo=ESTADO_PAGO[inv.estadoPago]||ESTADO_PAGO.pendiente;
  const tipoInfo=TIPO_INFO[campana?.tipoCrowdfunding]||TIPO_INFO.reward;
  const TipoIcon=tipoInfo.icon;
  const pctCampana=getPct(campana?.montoRecaudado,campana?.metaRecaudacion);
  const alc=isMeta(campana);

  const retorno=campana?.tipoCrowdfunding==='lending'&&campana?.interesPct
    ? parseFloat(inv.monto)*(1+parseFloat(campana.interesPct)/100)
    : null;
  const diasRetorno=campana?.plazoRetornoDias&&inv.fechaCreacion
    ? Math.max(0,campana.plazoRetornoDias-Math.floor((new Date()-new Date(inv.fechaCreacion))/86400000))
    : null;

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      borderRadius:'16px',border:'1.5px solid var(--border)',background:'#fff',
      transition:'all 250ms cubic-bezier(.34,1.2,.64,1)',
      transform:hov?'translateY(-4px)':'none',
      boxShadow:hov?'0 16px 36px rgba(0,0,0,.1)':'0 2px 8px rgba(0,0,0,.05)',
      display:'flex',flexDirection:'column',overflow:'hidden',
    }}>
      <div style={{height:'5px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`}}/>
      <div style={{padding:'16px',flex:1,display:'flex',flexDirection:'column',gap:'12px'}}>

        <div style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'12px',flexShrink:0,background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {alc?<Trophy style={{width:'18px',height:'18px',color:'#fff'}}/>:<Megaphone style={{width:'18px',height:'18px',color:'#fff'}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{campana?.titulo}</div>
            <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{campana?.negocio?.nombreNegocio}</div>
          </div>
          <span style={{padding:'3px 9px',borderRadius:'99px',fontSize:'11px',fontWeight:700,background:estadoInfo.bg,color:estadoInfo.color,display:'inline-flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:estadoInfo.dot}}/>{estadoInfo.label}
          </span>
        </div>

        <div style={{padding:'12px',borderRadius:'12px',background:'var(--gray-50)',border:'1px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
            <span style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'.05em'}}>Tu aportación</span>
            <span style={{fontSize:'10px',color:'var(--gray-400)',fontFamily:"'JetBrains Mono',monospace"}}>{inv.referencia}</span>
          </div>
          <div style={{fontSize:'22px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(inv.monto)}</div>
          <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>{fmtD(inv.fechaCreacion)}</div>
        </div>

        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
            <span style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>Progreso de campaña</span>
            <span style={{fontSize:'11px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif"}}>{pctCampana}%</span>
          </div>
          <div style={{height:'5px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`,width:`${pctCampana}%`,transition:'width 1s ease'}}/>
          </div>
        </div>

        {inv.estadoPago==='confirmado'&&(
          <div style={{padding:'10px 12px',borderRadius:'12px',background:tipoInfo.bg,border:`1px solid ${tipoInfo.color}30`,display:'flex',alignItems:'center',gap:'10px'}}>
            <TipoIcon style={{width:'16px',height:'16px',color:tipoInfo.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              {campana?.tipoCrowdfunding==='lending'&&retorno?(
                <>
                  <div style={{fontSize:'12px',fontWeight:700,color:tipoInfo.color,fontFamily:"'DM Sans',sans-serif"}}>Retorno esperado: {fmtM(retorno)}</div>
                  {diasRetorno!==null&&<div style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>En ~{diasRetorno} días · {campana?.interesPct}% anual</div>}
                </>
              ):(
                <>
                  <div style={{fontSize:'12px',fontWeight:700,color:tipoInfo.color,fontFamily:"'DM Sans',sans-serif"}}>Recompensa pendiente</div>
                  {campana?.recompensaDesc&&<div style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{campana.recompensaDesc}</div>}
                </>
              )}
            </div>
          </div>
        )}

        <button onClick={()=>onVerCampana(campana?.id)}
          style={{width:'100%',padding:'8px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',transition:'all 150ms'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--gray-50)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#fff';}}>
          <Megaphone style={{width:'12px',height:'12px'}}/> Ver campaña <ChevronRight style={{width:'12px',height:'12px',marginLeft:'auto'}}/>
        </button>
      </div>
    </div>
  );
};

// ─── Card de campaña seguida ──────────────────────────────────────────────────
const CampanaSeguida = ({ campana:c, miInversion, onClick }) => {
  const [c1,c2]=getClr(c.id);
  const alc=isMeta(c);
  const pct=getPct(c.montoRecaudado,c.metaRecaudacion);
  const tipoInfo=TIPO_INFO[c.tipoCrowdfunding]||TIPO_INFO.reward;

  return (
    <div onClick={onClick}
      style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',borderRadius:'14px',border:'1.5px solid var(--border)',background:'#fff',cursor:'pointer',transition:'all 150ms'}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--gray-50)';e.currentTarget.style.borderColor='var(--capyme-blue-mid)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='var(--border)';}}>
      <div style={{width:'44px',height:'44px',borderRadius:'12px',flexShrink:0,background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {alc?<Trophy style={{width:'20px',height:'20px',color:'#fff'}}/>:<Megaphone style={{width:'20px',height:'20px',color:'#fff'}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.titulo}</div>
        <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'5px'}}>
          <div style={{flex:1,height:'5px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`,width:`${pct}%`}}/>
          </div>
          <span style={{fontSize:'11px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{pct}%</span>
        </div>
      </div>
      <div style={{textAlign:'right',flexShrink:0}}>
        <div style={{fontSize:'13px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(miInversion)}</div>
        <div style={{fontSize:'10px',color:tipoInfo.color,fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:'flex',alignItems:'center',gap:'2px',justifyContent:'flex-end',marginTop:'2px'}}>
          <tipoInfo.icon style={{width:'9px',height:'9px'}}/>{tipoInfo.label}
        </div>
      </div>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const MisInversiones = () => {
  const [inversiones, setInversiones] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtro,      setFiltro]      = useState('todas');
  const [vistaMode,   setVistaMode]   = useState('resumen');

  useEffect(()=>{ cargarDatos(); },[]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res=await inversionesService.getMias();
      setInversiones(res.data||[]);
    } catch { toast.error('Error al cargar mis inversiones'); }
    finally { setLoading(false); }
  };

  const confirmadas=inversiones.filter(i=>i.estadoPago==='confirmado'&&i.activo);
  const pendientes =inversiones.filter(i=>i.estadoPago==='pendiente'&&i.activo);

  const totalInvertido=confirmadas.reduce((a,i)=>a+parseFloat(i.monto||0),0);
  const retornoEsperado=confirmadas
    .filter(i=>i.campana?.tipoCrowdfunding==='lending'&&i.campana?.interesPct)
    .reduce((a,i)=>a+parseFloat(i.monto||0)*(parseFloat(i.campana.interesPct)/100),0);
  const campanasUnicas=new Set(confirmadas.map(i=>i.campanaId));

  const porCampana=Object.values(
    confirmadas.reduce((acc,i)=>{
      const k=i.campanaId;
      if(!acc[k]) acc[k]={campana:i.campana,miMonto:0,inversiones:[]};
      acc[k].miMonto+=parseFloat(i.monto||0);
      acc[k].inversiones.push(i);
      return acc;
    },{})
  );

  const invFiltradas=inversiones.filter(i=>{
    if(filtro==='activas')     return i.campana?.estado==='activa'&&i.activo;
    if(filtro==='completadas') return isMeta(i.campana);
    if(filtro==='lending')     return i.campana?.tipoCrowdfunding==='lending';
    if(filtro==='reward')      return i.campana?.tipoCrowdfunding==='reward';
    if(filtro==='pendientes')  return i.estadoPago==='pendiente';
    return i.activo;
  });

  if(loading) return(
    <Layout><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid var(--gray-200)',borderTopColor:'var(--capyme-blue-mid)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div></Layout>
  );

  return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{padding:'32px 24px',maxWidth:'1280px',margin:'0 auto',animation:'fadeUp .4s ease'}}>

        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontSize:'28px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px'}}>Mis inversiones</h1>
          <p style={{fontSize:'14px',color:'var(--gray-500)',margin:0,fontFamily:"'DM Sans',sans-serif"}}>Sigue el progreso de los proyectos que estás apoyando</p>
        </div>

        {pendientes.length>0&&(
          <div style={{padding:'12px 16px',borderRadius:'12px',marginBottom:'20px',background:'#FEF9C3',border:'1px solid #FDE68A',display:'flex',alignItems:'center',gap:'10px'}}>
            <AlertCircle style={{width:'16px',height:'16px',color:'#D97706',flexShrink:0}}/>
            <span style={{fontSize:'13px',fontFamily:"'DM Sans',sans-serif",color:'#92400E',fontWeight:600}}>
              Tienes {pendientes.length} inversión{pendientes.length!==1?'es':''} en proceso de confirmación.
            </span>
            <button onClick={()=>setFiltro('pendientes')} style={{marginLeft:'auto',padding:'4px 12px',border:'1.5px solid #D97706',borderRadius:'8px',background:'transparent',color:'#D97706',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Ver</button>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'28px'}}>
          {[
            {icon:Heart,      label:'Total invertido',   value:fmtM(totalInvertido),   color:'#EF4444', sub:`${confirmadas.length} confirmadas`},
            {icon:TrendingUp, label:'Retorno esperado',  value:fmtM(retornoEsperado),  color:'#8B5CF6', sub:'de préstamos activos'},
            {icon:Megaphone,  label:'Campañas apoyadas', value:campanasUnicas.size,     color:'var(--capyme-blue-mid)', sub:'proyectos únicos'},
            {icon:Clock,      label:'Pendientes',        value:pendientes.length,        color:'#F59E0B', sub:'por confirmar'},
            {icon:Trophy,     label:'Metas alcanzadas',  value:porCampana.filter(p=>isMeta(p.campana)).length, color:'#7C3AED', sub:'campañas completadas'},
          ].map(({icon:Icon,label,value,color,sub})=>(
            <div key={label} style={{padding:'18px 20px',borderRadius:'16px',background:'#fff',border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'9px',background:color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon style={{width:'17px',height:'17px',color}}/>
                </div>
                <ArrowUpRight style={{width:'13px',height:'13px',color:'var(--gray-300)'}}/>
              </div>
              <div style={{fontSize:'22px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1}}>{value}</div>
              <div style={{fontSize:'11px',fontWeight:600,color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",marginTop:'3px'}}>{label}</div>
              {sub&&<div style={{fontSize:'11px',color,fontFamily:"'DM Sans',sans-serif",fontWeight:600,marginTop:'2px'}}>{sub}</div>}
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'24px',alignItems:'start'}}>

          {/* Columna principal */}
          <div>
            <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
              {[
                {v:'resumen',     l:'🏠 Resumen'},
                {v:'todas',       l:'📋 Todas'},
                {v:'pendientes',  l:'⏳ Pendientes'},
                {v:'lending',     l:'💜 Préstamos'},
                {v:'reward',      l:'🎁 Recompensas'},
                {v:'completadas', l:'🏆 Completadas'},
              ].map(({v,l})=>(
                <button key={v}
                  onClick={()=>{setFiltro(v==='resumen'?'todas':v);setVistaMode(v==='resumen'?'resumen':'lista');}}
                  style={{
                    padding:'8px 14px',borderRadius:'99px',fontSize:'12px',fontWeight:600,cursor:'pointer',
                    border:(vistaMode==='resumen'&&v==='resumen')||(vistaMode!=='resumen'&&filtro===(v==='resumen'?'todas':v))?'none':'1.5px solid var(--border)',
                    background:(vistaMode==='resumen'&&v==='resumen')||(vistaMode!=='resumen'&&filtro===(v==='resumen'?'todas':v))?'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)':'#fff',
                    color:(vistaMode==='resumen'&&v==='resumen')||(vistaMode!=='resumen'&&filtro===(v==='resumen'?'todas':v))?'#fff':'var(--gray-600)',
                    fontFamily:"'DM Sans',sans-serif",transition:'all 150ms',
                  }}>
                  {l}
                </button>
              ))}
            </div>

            {vistaMode==='resumen'&&(
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                <h3 style={{fontSize:'15px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 4px'}}>Campañas que estoy apoyando</h3>
                {porCampana.length===0?(
                  <div style={{padding:'48px',textAlign:'center',borderRadius:'16px',border:'2px dashed var(--border)'}}>
                    <Heart style={{width:'40px',height:'40px',color:'var(--gray-200)',margin:'0 auto 12px',display:'block'}}/>
                    <p style={{fontSize:'14px',fontWeight:700,color:'var(--gray-500)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 4px'}}>Aún no has apoyado ningún proyecto</p>
                    <p style={{fontSize:'13px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:'0 0 20px'}}>Explora las campañas activas y apoya emprendedores</p>
                    <a href="/campanas" style={{padding:'10px 24px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 4px 14px rgba(79,70,229,.3)'}}>
                      <Sparkles style={{width:'14px',height:'14px'}}/> Explorar campañas
                    </a>
                  </div>
                ):(
                  porCampana.sort((a,b)=>b.miMonto-a.miMonto).map(({campana,miMonto})=>(
                    <CampanaSeguida key={campana.id} campana={campana} miInversion={miMonto}
                      onClick={()=>{ window.location.href='/campanas'; }}/>
                  ))
                )}
              </div>
            )}

            {vistaMode==='lista'&&(
              invFiltradas.length===0?(
                <div style={{padding:'48px',textAlign:'center',borderRadius:'16px',border:'2px dashed var(--border)'}}>
                  <TrendingUp style={{width:'40px',height:'40px',color:'var(--gray-200)',margin:'0 auto 12px',display:'block'}}/>
                  <p style={{fontSize:'14px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>No hay inversiones con este filtro</p>
                </div>
              ):(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
                  {invFiltradas.map(inv=>(
                    <InvCard key={inv.id} inv={inv} onVerCampana={()=>{ window.location.href='/campanas'; }}/>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Columna derecha */}
          <div style={{position:'sticky',top:'20px',display:'flex',flexDirection:'column',gap:'16px'}}>

            <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'#fff',padding:'20px',boxShadow:'0 4px 20px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 16px',display:'flex',alignItems:'center',gap:'8px'}}>
                <BarChart2 style={{width:'15px',height:'15px',color:'var(--capyme-blue-mid)'}}/> Mi cartera
              </h3>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {[
                  {label:'Confirmado',  value:fmtM(totalInvertido),  color:'#10B981'},
                  {label:'Pendiente',   value:fmtM(pendientes.reduce((a,i)=>a+parseFloat(i.monto||0),0)), color:'#F59E0B'},
                  {label:'Retorno est.',value:fmtM(retornoEsperado), color:'#8B5CF6'},
                ].map(({label,value,color})=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:'10px',background:'var(--gray-50)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:color}}/>
                      <span style={{fontSize:'12px',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
                    </div>
                    <span style={{fontSize:'13px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'#fff',padding:'20px',boxShadow:'0 4px 20px rgba(0,0,0,.06)'}}>
              <h3 style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 16px',display:'flex',alignItems:'center',gap:'8px'}}>
                <Gift style={{width:'15px',height:'15px',color:'#F59E0B'}}/> Por tipo
              </h3>
              {[
                {tipo:'reward',  label:'Recompensa', color:'#F59E0B'},
                {tipo:'lending', label:'Préstamo',   color:'#8B5CF6'},
              ].map(({tipo,label,color})=>{
                const montoTipo=confirmadas.filter(i=>i.campana?.tipoCrowdfunding===tipo).reduce((a,i)=>a+parseFloat(i.monto||0),0);
                const pctTipo=totalInvertido?Math.round((montoTipo/totalInvertido)*100):0;
                return (
                  <div key={tipo} style={{marginBottom:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                      <span style={{fontSize:'12px',fontWeight:600,color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
                      <span style={{fontSize:'12px',fontWeight:700,color,fontFamily:"'DM Sans',sans-serif"}}>{pctTipo}% · {fmtM(montoTipo)}</span>
                    </div>
                    <div style={{height:'6px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:'99px',background:color,width:`${pctTipo}%`,transition:'width 1s ease'}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <a href="/campanas" style={{display:'block',padding:'14px',borderRadius:'14px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',textDecoration:'none',textAlign:'center',boxShadow:'0 4px 14px rgba(79,70,229,.3)'}}>
              <div style={{fontSize:'14px',fontWeight:800,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'7px'}}>
                <Sparkles style={{width:'15px',height:'15px'}}/> Explorar más campañas
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.7)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>Encuentra tu próximo proyecto</div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MisInversiones;