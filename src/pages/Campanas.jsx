import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, Users, Clock, ArrowLeft, Heart, Share2,
  CheckCircle, Edit2, ToggleLeft, ToggleRight, ChevronDown,
  X, Star, Megaphone, LayoutGrid, Table2, Trophy,
  Target, Calendar, Ban, RotateCcw, DollarSign, CreditCard,
  AlertCircle,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { campanasService } from '../services/campanasService';
import { negociosService } from '../services/negociosService';
import { inversionesService } from '../services/inversionesService';

// ─── Config ───────────────────────────────────────────────────────────────────
const ESTADO_INFO = {
  en_revision: { label: 'En revisión', bg: '#FEF9C3', color: '#854D0E', dot: '#F59E0B' },
  aprobada:    { label: 'Aprobada',    bg: '#DCFCE7', color: '#14532D', dot: '#22C55E' },
  rechazada:   { label: 'Rechazada',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  activa:      { label: 'Activa',     bg: '#DBEAFE', color: '#1E3A8A', dot: '#3B82F6' },
  pausada:     { label: 'Pausada',    bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  completada:  { label: 'Completada', bg: '#FDF4FF', color: '#581C87', dot: '#A855F7' },
  cancelada:   { label: 'Cancelada',  bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
};
const ESTADOS_LISTA = Object.keys(ESTADO_INFO);

const COLORES = [
  ['#667EEA','#764BA2'], ['#11998E','#38EF7D'], ['#F093FB','#F5576C'],
  ['#4FACFE','#00F2FE'], ['#43E97B','#38F9D7'], ['#FA709A','#FEE140'],
  ['#A18CD1','#FBC2EB'], ['#0BA360','#3CBA92'],
];

const initForm = { titulo:'', descripcion:'', historia:'', negocioId:'', metaRecaudacion:'', fechaInicio:'', fechaCierre:'' };

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtM  = v => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v||0);
const fmtD  = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const getDias = c => { if(!c) return null; const d=Math.ceil((new Date(c)-new Date())/86400000); return d>0?d:0; };
const getPct  = (r,m) => (!m||!parseFloat(m)) ? 0 : Math.min(100,Math.round((parseFloat(r)/parseFloat(m))*100));
const isMeta  = c => parseFloat(c.metaRecaudacion||0)>0 && parseFloat(c.montoRecaudado||0)>=parseFloat(c.metaRecaudacion||1);
const getClrs = c => COLORES[(c.id||0)%COLORES.length];

// ─── EstadoBadge ──────────────────────────────────────────────────────────────
const EstadoBadge = ({ campana, size='sm' }) => {
  const alc  = isMeta(campana);
  const info = ESTADO_INFO[campana.estado] || ESTADO_INFO.en_revision;
  return (
    <span style={{
      padding: size==='sm'?'3px 10px':'5px 14px',
      borderRadius:'99px', fontSize: size==='sm'?'11px':'13px', fontWeight:700,
      background: alc ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : info.bg,
      color: alc ? '#fff' : info.color,
      display:'inline-flex', alignItems:'center', gap:'5px',
      fontFamily:"'DM Sans',sans-serif",
      boxShadow: alc ? '0 2px 8px rgba(168,85,247,.35)' : 'none',
    }}>
      {alc
        ? <><Trophy style={{width:'11px',height:'11px'}}/> ¡Meta alcanzada!</>
        : <><span style={{width:'6px',height:'6px',borderRadius:'50%',background:info.dot,flexShrink:0}}/>{info.label}</>
      }
    </span>
  );
};

// ─── BarraProgreso ────────────────────────────────────────────────────────────
const BarraProgreso = ({ campana, h=6 }) => {
  const p = getPct(campana.montoRecaudado, campana.metaRecaudacion);
  const alc = isMeta(campana);
  const [c1,c2] = getClrs(campana);
  return (
    <div>
      <div style={{height:`${h}px`,borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:'99px',
          background: alc ? 'linear-gradient(90deg,#7C3AED,#A855F7)' : `linear-gradient(90deg,${c1},${c2})`,
          width:`${p}%`, transition:'width 900ms cubic-bezier(.34,1,.64,1)',
          boxShadow: alc ? '0 0 8px rgba(168,85,247,.5)' : 'none',
        }}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'5px'}}>
        <span style={{fontSize:'13px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(campana.montoRecaudado)}</span>
        <span style={{fontSize:'12px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{p}%</span>
      </div>
      <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>meta: {fmtM(campana.metaRecaudacion)}</div>
    </div>
  );
};

// ─── Modal de apoyo — SOLO monto + flujo de pago ──────────────────────────────
// Fases: 'monto' → 'processing' → 'success'
const ApoyarModal = ({ campana, currentUser, onClose, onSuccess }) => {
  const [fase,   setFase]   = useState('monto');
  const [monto,  setMonto]  = useState('');
  const [notas,  setNotas]  = useState('');
  const [err,    setErr]    = useState('');
  const [invRes, setInvRes] = useState(null);
  const alc = isMeta(campana);
  const [c1,c2] = getClrs(campana);

  const handlePagar = async () => {
    const m = parseFloat(monto);
    if (!monto || isNaN(m) || m <= 0) { setErr('Ingresa un monto válido'); return; }
    setErr('');
    setFase('processing');
    try {
      await new Promise(r => setTimeout(r, 1800)); // simula pasarela
      const res = await inversionesService.create({
        campanaId: campana.id,
        monto: m,
        notas: notas || undefined,
      });
      setInvRes(res.data);
      setFase('success');
      onSuccess();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al procesar el pago');
      setFase('monto');
    }
  };

  return (
    <div
      onClick={fase === 'processing' ? undefined : onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(6px)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{background:'#fff',borderRadius:'24px',width:'100%',maxWidth:'420px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.25)'}}
      >
        {/* Header con gradiente de campaña */}
        <div style={{
          padding:'20px 24px',
          background: fase === 'success'
            ? 'linear-gradient(135deg,#10B981,#059669)'
            : `linear-gradient(135deg,${c1},${c2})`,
          display:'flex',alignItems:'center',gap:'12px',
          transition:'background 600ms ease',
        }}>
          <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {fase==='success' ? <CheckCircle style={{width:'20px',height:'20px',color:'#fff'}}/> : <Heart style={{width:'20px',height:'20px',color:'#fff'}}/>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'16px',fontWeight:800,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",textShadow:'0 1px 3px rgba(0,0,0,.15)'}}>
              {fase==='monto' ? 'Apoyar campaña' : fase==='processing' ? 'Procesando pago...' : '¡Pago exitoso!'}
            </div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.75)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {campana.titulo}
            </div>
          </div>
          {fase === 'monto' && (
            <button onClick={onClose} style={{width:'30px',height:'30px',border:'none',background:'rgba(255,255,255,.2)',borderRadius:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <X style={{width:'14px',height:'14px',color:'#fff'}}/>
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div style={{padding:'24px'}}>

          {/* ── fase: monto ── */}
          {fase === 'monto' && (
            <>
              <div style={{marginBottom:'8px',fontSize:'13px',fontWeight:600,color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>
                ¿Cuánto deseas aportar?
              </div>

              {/* Input grande de monto */}
              <div style={{position:'relative',marginBottom:'12px'}}>
                <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',fontSize:'20px',fontWeight:900,color:'var(--gray-400)',fontFamily:"'Plus Jakarta Sans',sans-serif",pointerEvents:'none'}}>$</span>
                <input
                  type="number"
                  min="1"
                  value={monto}
                  onChange={e => { setMonto(e.target.value); setErr(''); }}
                  placeholder="0"
                  autoFocus
                  style={{
                    width:'100%',padding:'14px 14px 14px 36px',
                    border: err ? '2px solid #EF4444' : '2px solid var(--border)',
                    borderRadius:'14px',
                    fontSize:'28px',fontWeight:900,fontFamily:"'Plus Jakarta Sans',sans-serif",
                    color:'var(--gray-900)',outline:'none',boxSizing:'border-box',
                    textAlign:'center',
                    transition:'border-color 150ms',
                  }}
                  onFocus={e => { if (!err) e.currentTarget.style.borderColor = c1; }}
                  onBlur={e  => { if (!err) e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {err && (
                <p style={{margin:'0 0 12px',fontSize:'12px',color:'#EF4444',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'4px'}}>
                  <AlertCircle style={{width:'12px',height:'12px'}}/>{err}
                </p>
              )}

              {/* Pills de monto rápido */}
              <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
                {[500,1000,2500,5000].map(amt => {
                  const sel = String(monto) === String(amt);
                  return (
                    <button key={amt} onClick={() => { setMonto(String(amt)); setErr(''); }} style={{
                      padding:'6px 14px',borderRadius:'99px',
                      border: sel ? 'none' : '1.5px solid var(--border)',
                      background: sel ? `linear-gradient(135deg,${c1},${c2})` : '#fff',
                      color: sel ? '#fff' : 'var(--gray-700)',
                      fontSize:'13px',fontWeight:700,cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif",
                      transition:'all 150ms',
                      boxShadow: sel ? '0 2px 8px rgba(0,0,0,.15)' : 'none',
                    }}>
                      {fmtM(amt)}
                    </button>
                  );
                })}
              </div>

              {/* Nota opcional */}
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--gray-500)',marginBottom:'6px',fontFamily:"'DM Sans',sans-serif"}}>
                  Mensaje para el emprendedor (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={2}
                  placeholder="¡Mucho éxito con tu proyecto! 🚀"
                  style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--border)',borderRadius:'10px',fontSize:'13px',fontFamily:"'DM Sans',sans-serif",color:'var(--gray-900)',outline:'none',resize:'none',boxSizing:'border-box'}}
                />
              </div>

              {/* Resumen antes de pagar */}
              {monto && parseFloat(monto) > 0 && (
                <div style={{padding:'12px 16px',borderRadius:'12px',background:'var(--gray-50)',border:'1px solid var(--border)',marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'.05em'}}>Total a pagar</div>
                    <div style={{fontSize:'22px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(monto)}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                    <CreditCard style={{width:'15px',height:'15px',color:'var(--capyme-blue-mid)'}}/>
                    Pago electrónico
                  </div>
                </div>
              )}

              <button
                onClick={handlePagar}
                style={{
                  width:'100%',padding:'14px',
                  background: !monto || parseFloat(monto)<=0
                    ? 'var(--gray-200)'
                    : `linear-gradient(135deg,${c1},${c2})`,
                  border:'none',borderRadius:'14px',color:'#fff',
                  fontSize:'15px',fontWeight:800,cursor:'pointer',
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  letterSpacing:'.02em',
                  boxShadow: !monto||parseFloat(monto)<=0 ? 'none' : '0 4px 16px rgba(0,0,0,.2)',
                  transition:'all 200ms',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:'9px',
                }}
                onMouseEnter={e => { if(monto&&parseFloat(monto)>0){e.currentTarget.style.transform='scale(1.01)';} }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
              >
                <CreditCard style={{width:'18px',height:'18px'}}/>
                Pagar ahora
              </button>
            </>
          )}

          {/* ── fase: processing ── */}
          {fase === 'processing' && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'28px 0',gap:'20px'}}>
              <div style={{width:'64px',height:'64px',border:`4px solid ${c1}30`,borderTopColor:c1,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
              <div style={{textAlign:'center'}}>
                <p style={{fontSize:'16px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px'}}>Procesando tu pago...</p>
                <p style={{fontSize:'13px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",margin:0}}>No cierres esta ventana</p>
              </div>
            </div>
          )}

          {/* ── fase: success ── */}
          {fase === 'success' && invRes && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'18px'}}>
              <div style={{width:'72px',height:'72px',background:'linear-gradient(135deg,#10B981,#059669)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 28px rgba(16,185,129,.4)',animation:'popIn .4s cubic-bezier(.34,1.56,.64,1)'}}>
                <CheckCircle style={{width:'38px',height:'38px',color:'#fff'}}/>
              </div>
              <div style={{textAlign:'center'}}>
                <p style={{fontSize:'20px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 4px'}}>¡Gracias por tu apoyo!</p>
                <p style={{fontSize:'13px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Tu inversión fue confirmada</p>
              </div>
              <div style={{width:'100%',background:'var(--gray-50)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
                {[
                  {k:'Referencia', v:invRes.referencia, mono:true},
                  {k:'Monto invertido', v:fmtM(invRes.monto), bold:true, green:true},
                  {k:'Campaña', v:invRes.campana?.titulo},
                  {k:'Estado', v:'✓ Confirmado', green:true},
                ].map(({k,v,mono,bold,green}) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'6px',borderBottom:'1px solid var(--gray-100)'}}>
                    <span style={{fontSize:'12px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{k}</span>
                    <span style={{fontSize:bold?'15px':'13px',fontWeight:bold?900:600,color:green?'#065F46':'var(--gray-900)',fontFamily:mono?"'JetBrains Mono',monospace":"'DM Sans',sans-serif"}}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#10B981,#059669)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'14px',fontWeight:800,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 14px rgba(16,185,129,.35)'}}>
                ¡Entendido!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── CampanaCard ──────────────────────────────────────────────────────────────
const CampanaCard = ({ campana:c, onClick, onEdit, onToggleEstado, onToggleActivo, onApoyar, esAdmin, esColab, currentUser }) => {
  const [hov, setHov] = useState(false);
  const d = getDias(c.fechaCierre);
  const [c1,c2] = getClrs(c);
  const alc = isMeta(c);
  const esDueno = currentUser?.rol==='cliente' && c.negocio?.usuarioId===currentUser.id;
  const puedeApoyar = !alc && c.activo && !esDueno && (c.estado==='aprobada'||c.estado==='activa');

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      borderRadius:'16px', border:`1.5px solid ${alc?'#A855F750':'var(--border)'}`,
      overflow:'hidden', background:'#fff',
      transition:'all 250ms cubic-bezier(.34,1.2,.64,1)',
      transform: hov?'translateY(-6px)':'translateY(0)',
      boxShadow: hov ? (alc?'0 20px 40px rgba(168,85,247,.2)':'0 20px 40px rgba(0,0,0,.12)') : '0 2px 8px rgba(0,0,0,.05)',
      cursor:'pointer', opacity:c.activo?1:.5,
      display:'flex', flexDirection:'column', position:'relative',
    }}>
      {alc&&<div style={{position:'absolute',top:0,left:0,right:0,height:'4px',zIndex:2,background:'linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#7C3AED)',backgroundSize:'200% 100%',animation:'shimmer 2s linear infinite'}}/>}

      {/* Portada */}
      <div onClick={onClick} style={{height:'140px',background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'rgba(255,255,255,.2)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.3)'}}>
          {alc?<Trophy style={{width:'28px',height:'28px',color:'#fff'}}/>:<Megaphone style={{width:'26px',height:'26px',color:'#fff'}}/>}
        </div>
        <div style={{position:'absolute',top:'12px',left:'12px'}}><EstadoBadge campana={c}/></div>
        {(esAdmin||esColab)&&(
          <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',gap:'4px'}}>
            <button onClick={e=>{e.stopPropagation();onEdit();}} style={{width:'30px',height:'30px',borderRadius:'8px',background:'rgba(255,255,255,.9)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Editar">
              <Edit2 style={{width:'13px',height:'13px',color:'var(--gray-600)'}}/>
            </button>
            {esAdmin&&(
              <button onClick={e=>{e.stopPropagation();onToggleActivo();}} style={{width:'30px',height:'30px',borderRadius:'8px',background:'rgba(255,255,255,.9)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title={c.activo?'Desactivar':'Activar'}>
                {c.activo?<ToggleRight style={{width:'14px',height:'14px',color:'#10B981'}}/>:<ToggleLeft style={{width:'14px',height:'14px',color:'#9CA3AF'}}/>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{padding:'16px',flex:1,display:'flex',flexDirection:'column'}}>
        <div onClick={onClick} style={{flex:1,display:'flex',flexDirection:'column'}}>
          <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",marginBottom:'4px'}}>{c.negocio?.nombreNegocio}</div>
          <h3 style={{fontSize:'15px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.titulo}</h3>
          <p style={{fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",margin:'0 0 12px',lineHeight:1.5,flex:1,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.descripcion||'Sin descripción'}</p>
          <BarraProgreso campana={c}/>
        </div>

        {/* Footer */}
        <div style={{paddingTop:'12px',marginTop:'12px',borderTop:'1px solid var(--gray-100)',display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <Users style={{width:'12px',height:'12px',color:'var(--gray-400)'}}/>
              <span style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>{c._count?.inversiones??c.inversiones?.length??0} inversores</span>
            </div>
            {d!==null&&(
              <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                <Clock style={{width:'12px',height:'12px',color:d<=7&&d>0?'#EF4444':'var(--gray-400)'}}/>
                <span style={{fontSize:'11px',color:d<=7&&d>0?'#EF4444':'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",fontWeight:d<=7?700:400}}>{d===0?'Finalizada':`${d} días`}</span>
              </div>
            )}
            {esAdmin&&(
              <button onClick={e=>{e.stopPropagation();onToggleEstado(e);}} style={{marginLeft:'auto',padding:'3px 10px',border:'1.5px solid var(--border)',borderRadius:'6px',background:'transparent',fontSize:'11px',fontWeight:600,color:'var(--gray-600)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'4px'}}>
                Estado <ChevronDown style={{width:'11px',height:'11px'}}/>
              </button>
            )}
          </div>

          {/* Botón Apoyar en la card */}
          {puedeApoyar && (
            <button
              onClick={e => { e.stopPropagation(); onApoyar(); }}
              style={{
                width:'100%', padding:'9px',
                background: `linear-gradient(135deg,${c1},${c2})`,
                border:'none', borderRadius:'10px', color:'#fff',
                fontSize:'13px', fontWeight:700, cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                boxShadow:'0 2px 10px rgba(0,0,0,.15)',
                transition:'all 200ms',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.01)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.22)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,.15)';}}
            >
              <Heart style={{width:'14px',height:'14px'}}/> Apoyar
            </button>
          )}
          {alc && (
            <div style={{textAlign:'center',padding:'8px',borderRadius:'10px',background:'linear-gradient(135deg,#7C3AED15,#A855F715)',border:'1px solid #A855F740',fontSize:'12px',fontWeight:700,color:'#581C87',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
              <Trophy style={{width:'12px',height:'12px'}}/> Meta alcanzada
            </div>
          )}
          {esDueno && !alc && (
            <div style={{textAlign:'center',padding:'8px',borderRadius:'10px',background:'var(--capyme-blue-pale)',fontSize:'12px',fontWeight:600,color:'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif"}}>
              Tu campaña
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Vista Detalle de campaña ─────────────────────────────────────────────────
const CampanaDetalle = ({ campana:c, currentUser, onBack, onApoyar, recargar }) => {
  const [inversores, setInversores] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const alc = isMeta(c);
  const d   = getDias(c.fechaCierre);
  const [c1,c2] = getClrs(c);
  const porcentaje = getPct(c.montoRecaudado, c.metaRecaudacion);
  const esDueno = currentUser.rol==='cliente' && c.negocio?.usuarioId===currentUser.id;
  const puedeApoyar = !alc && c.activo && !esDueno && (c.estado==='aprobada'||c.estado==='activa');

  useEffect(()=>{
    inversionesService.getByCampana(c.id)
      .then(r=>setInversores(r.data||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[c.id]);

  const confirmed = inversores.filter(i=>i.estadoPago==='confirmado');

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',paddingBottom:'48px'}}>
      <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 0',background:'none',border:'none',color:'var(--gray-500)',fontSize:'13px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginBottom:'20px'}}>
        <ArrowLeft style={{width:'15px',height:'15px'}}/> Volver a campañas
      </button>

      {alc && (
        <div style={{padding:'14px 18px',borderRadius:'14px',marginBottom:'24px',background:'linear-gradient(135deg,#7C3AED15,#A855F715)',border:'1.5px solid #A855F750',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'10px',flexShrink:0,background:'linear-gradient(135deg,#7C3AED,#A855F7)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(168,85,247,.35)'}}><Trophy style={{width:'20px',height:'20px',color:'#fff'}}/></div>
          <div>
            <div style={{fontSize:'14px',fontWeight:800,color:'#581C87',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>¡Esta campaña alcanzó su meta! 🎉</div>
            <div style={{fontSize:'12px',color:'#7C3AED',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>Se recaudó el 100% del objetivo. Gracias a todos los inversores.</div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{height:'260px',borderRadius:'20px',marginBottom:'28px',background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,position:'relative',overflow:'hidden',display:'flex',alignItems:'flex-end'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.5),transparent)'}}/>
        <div style={{position:'relative',padding:'28px',width:'100%'}}>
          <div style={{marginBottom:'8px'}}><EstadoBadge campana={c} size="md"/></div>
          <h1 style={{fontSize:'26px',fontWeight:900,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 4px',textShadow:'0 2px 8px rgba(0,0,0,.2)'}}>{c.titulo}</h1>
          <p style={{color:'rgba(255,255,255,.8)',fontSize:'13px',margin:0,fontFamily:"'DM Sans',sans-serif"}}>por {c.negocio?.nombreNegocio}</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'28px',alignItems:'start'}}>
        {/* Columna izquierda */}
        <div>
          {c.descripcion&&(
            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'16px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 10px'}}>Sobre este proyecto</h2>
              <p style={{fontSize:'14px',color:'var(--gray-600)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif",margin:0}}>{c.descripcion}</p>
            </div>
          )}
          {c.historia&&(
            <div style={{padding:'20px',borderRadius:'14px',marginBottom:'24px',background:alc?'linear-gradient(135deg,#7C3AED10,#A855F710)':'linear-gradient(135deg,var(--capyme-blue-pale),#F0FDF4)',border:`1px solid ${alc?'#A855F740':'var(--border)'}`}}>
              <h2 style={{fontSize:'16px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 10px',display:'flex',alignItems:'center',gap:'8px'}}>
                <Star style={{width:'16px',height:'16px',color:alc?'#A855F7':'var(--capyme-blue-mid)'}}/> Nuestra historia
              </h2>
              <p style={{fontSize:'14px',color:'var(--gray-600)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif",margin:0,whiteSpace:'pre-line'}}>{c.historia}</p>
            </div>
          )}
          <h2 style={{fontSize:'16px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 14px',display:'flex',alignItems:'center',gap:'8px'}}>
            <Users style={{width:'16px',height:'16px',color:'var(--gray-400)'}}/> Inversores ({confirmed.length})
          </h2>
          {loading ? (
            <div style={{textAlign:'center',padding:'24px',color:'var(--gray-400)',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"}}>Cargando...</div>
          ) : confirmed.length===0 ? (
            <div style={{padding:'24px',borderRadius:'12px',border:'1.5px dashed var(--border)',textAlign:'center',color:'var(--gray-400)',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"}}>
              {puedeApoyar?'Sé el primero en apoyar esta campaña 🚀':'Aún no hay inversores registrados'}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {confirmed.map(inv=>{
                const ini=`${inv.inversor?.nombre?.[0]||''}${inv.inversor?.apellido?.[0]||''}`.toUpperCase();
                const esMio=inv.inversorId===currentUser.id;
                return (
                  <div key={inv.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'10px',background:esMio?'linear-gradient(135deg,var(--capyme-blue-pale),#F0FDF4)':'var(--gray-50)',border:`1px solid ${esMio?'var(--capyme-blue-mid)':'transparent'}`}}>
                    <div style={{width:'34px',height:'34px',borderRadius:'10px',flexShrink:0,background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{ini}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif"}}>
                        {esMio&&!esDueno?'Tú':`${inv.inversor?.nombre} ${inv.inversor?.apellido?.[0]}.`}
                        {esMio&&<span style={{marginLeft:'6px',fontSize:'10px',background:'var(--capyme-blue-mid)',color:'#fff',padding:'1px 6px',borderRadius:'4px',fontWeight:700}}>TÚ</span>}
                      </div>
                      <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{fmtD(inv.fechaCreacion)}</div>
                    </div>
                    <div style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(inv.monto)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel lateral sticky */}
        <div style={{position:'sticky',top:'20px'}}>
          <div style={{borderRadius:'16px',border:`1.5px solid ${alc?'#A855F750':'var(--border)'}`,background:'#fff',padding:'20px',boxShadow:alc?'0 4px 24px rgba(168,85,247,.15)':'0 4px 20px rgba(0,0,0,.08)'}}>
            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'4px'}}>
                <span style={{fontSize:'22px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(c.montoRecaudado)}</span>
                <span style={{fontSize:'13px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{porcentaje}%</span>
              </div>
              <div style={{fontSize:'12px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",marginBottom:'10px'}}>de {fmtM(c.metaRecaudacion)} meta</div>
              <div style={{height:'10px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`,width:`${porcentaje}%`,transition:'width 1s ease',boxShadow:alc?'0 0 10px rgba(168,85,247,.5)':'none'}}/>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
              {[
                {icon:Users,label:'Inversores',value:confirmed.length},
                {icon:Clock,label:d===0?'Finalizada':'Días restantes',value:d===0?'—':(d??'—'),red:d!==null&&d<=7&&d>0},
                {icon:Calendar,label:'Inicio',value:fmtD(c.fechaInicio)},
                {icon:Target,label:'Cierre',value:fmtD(c.fechaCierre)},
              ].map(({icon:Icon,label,value,red})=>(
                <div key={label} style={{padding:'10px',borderRadius:'10px',background:'var(--gray-50)',border:'1px solid var(--gray-100)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px'}}>
                    <Icon style={{width:'11px',height:'11px',color:red?'#EF4444':'var(--gray-400)'}}/>
                    <span style={{fontSize:'10px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</span>
                  </div>
                  <div style={{fontSize:'13px',fontWeight:700,color:red?'#EF4444':'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{value}</div>
                </div>
              ))}
            </div>

            {alc ? (
              <div style={{padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#7C3AED15,#A855F715)',border:'1.5px solid #A855F750',textAlign:'center'}}>
                <Trophy style={{width:'24px',height:'24px',color:'#7C3AED',margin:'0 auto 6px',display:'block'}}/>
                <div style={{fontSize:'13px',fontWeight:800,color:'#581C87',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>¡Meta alcanzada!</div>
                <div style={{fontSize:'11px',color:'#7C3AED',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>Esta campaña ya logró su objetivo</div>
              </div>
            ) : puedeApoyar ? (
              <button
                onClick={onApoyar}
                style={{width:'100%',padding:'14px',background:`linear-gradient(135deg,${c1},${c2})`,border:'none',borderRadius:'14px',color:'#fff',fontSize:'15px',fontWeight:800,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'.02em',boxShadow:'0 4px 16px rgba(0,0,0,.2)',transition:'all 200ms',display:'flex',alignItems:'center',justifyContent:'center',gap:'9px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.25)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.2)';}}
              >
                <Heart style={{width:'18px',height:'18px'}}/> Apoyar esta campaña
              </button>
            ) : esDueno ? (
              <div style={{padding:'12px',borderRadius:'10px',background:'var(--capyme-blue-pale)',border:'1px solid var(--capyme-blue-mid)',textAlign:'center',fontSize:'12px',color:'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Esta es tu campaña — solo lectura</div>
            ) : (
              <div style={{padding:'12px',borderRadius:'10px',background:'var(--gray-50)',border:'1px solid var(--border)',textAlign:'center',fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif"}}>Esta campaña no acepta nuevas inversiones</div>
            )}

            <button style={{width:'100%',marginTop:'10px',padding:'9px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',fontSize:'12px',color:'var(--gray-600)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
              <Share2 style={{width:'13px',height:'13px'}}/> Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dropdown de estado ───────────────────────────────────────────────────────
const EstadoDropdown = ({ campana, pos, onSelect, onClose }) => {
  useEffect(()=>{ const fn=()=>onClose(); document.addEventListener('mousedown',fn); return ()=>document.removeEventListener('mousedown',fn); },[]);
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9998}}/>
      <div onMouseDown={e=>e.stopPropagation()} style={{position:'fixed',top:pos.bottom+6,left:pos.left,zIndex:9999,background:'#fff',border:'1px solid var(--border)',borderRadius:'12px',boxShadow:'0 8px 32px rgba(0,0,0,.15)',overflow:'hidden',minWidth:'180px',padding:'6px'}}>
        <div style={{padding:'6px 10px 8px',fontSize:'10px',fontWeight:700,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cambiar estado</div>
        {ESTADOS_LISTA.map(est=>{
          const info=ESTADO_INFO[est]; const act=campana.estado===est;
          return <button key={est} onClick={()=>onSelect(est)} style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'8px 10px',border:'none',background:act?info.bg:'transparent',borderRadius:'8px',cursor:'pointer',fontSize:'13px',color:act?info.color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",fontWeight:act?700:400,textAlign:'left'}}>
            <span style={{width:'8px',height:'8px',borderRadius:'50%',background:info.dot,flexShrink:0}}/>{info.label}{act&&<CheckCircle style={{width:'12px',height:'12px',marginLeft:'auto'}}/>}
          </button>;
        })}
      </div>
    </>
  );
};

// ─── Modal Crear/Editar campaña ───────────────────────────────────────────────
const CampanaModal = ({ mode, campana, negocios, currentUser, onClose, onSave }) => {
  const esCliente=currentUser.rol==='cliente';
  const metaBloq=mode==='edit'&&esCliente&&parseFloat(campana?.montoRecaudado||0)>0;
  const [form,setForm]=useState(mode==='edit'&&campana?{
    titulo:campana.titulo||'',descripcion:campana.descripcion||'',historia:campana.historia||'',
    negocioId:campana.negocioId||'',metaRecaudacion:campana.metaRecaudacion||'',
    fechaInicio:campana.fechaInicio?campana.fechaInicio.slice(0,10):'',
    fechaCierre:campana.fechaCierre?campana.fechaCierre.slice(0,10):'',
  }:initForm);
  const [errors,setErrors]=useState({});
  const [saving,setSaving]=useState(false);
  const validate=()=>{const e={};if(!form.titulo||form.titulo.length<3)e.titulo='Mínimo 3 caracteres';if(!form.negocioId)e.negocioId='Selecciona un negocio';if(!form.metaRecaudacion||parseFloat(form.metaRecaudacion)<=0)e.metaRecaudacion='Meta inválida';setErrors(e);return!Object.keys(e).length;};
  const handleSubmit=async()=>{if(!validate())return;setSaving(true);try{await onSave(form);}finally{setSaving(false);}};
  const inp={width:'100%',padding:'10px 12px',border:'1px solid var(--border)',borderRadius:'10px',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",color:'var(--gray-900)',background:'#fff',outline:'none',boxSizing:'border-box'};
  const lbl={display:'block',fontSize:'12px',fontWeight:700,color:'var(--gray-600)',marginBottom:'5px',fontFamily:"'DM Sans',sans-serif"};
  const Err=({k})=>errors[k]?<p style={{margin:'4px 0 0',fontSize:'11px',color:'#EF4444',fontFamily:"'DM Sans',sans-serif"}}>{errors[k]}</p>:null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',backdropFilter:'blur(5px)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px',width:'100%',maxWidth:'620px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,.2)'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0}}>{mode==='create'?'🚀 Nueva campaña':'✏️ Editar campaña'}</h2>
          <button onClick={onClose} style={{width:'32px',height:'32px',border:'none',background:'var(--gray-100)',borderRadius:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X style={{width:'15px',height:'15px',color:'var(--gray-500)'}}/></button>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Título *</label><input value={form.titulo} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} placeholder="Ej. Expansión de mi panadería" style={{...inp,...(errors.titulo?{borderColor:'#EF4444'}:{})}}/><Err k="titulo"/></div>
          <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Negocio *</label><select value={form.negocioId} onChange={e=>setForm(p=>({...p,negocioId:e.target.value}))} disabled={mode==='edit'&&esCliente} style={{...inp,appearance:'none',cursor:mode==='edit'&&esCliente?'not-allowed':'pointer',...(errors.negocioId?{borderColor:'#EF4444'}:{})}}><option value="">Seleccionar...</option>{negocios.map(n=><option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}</select><Err k="negocioId"/></div>
          <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Descripción breve</label><textarea value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} rows={2} placeholder="Resumen de tu proyecto..." style={{...inp,resize:'vertical'}}/></div>
          <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Historia del proyecto</label><textarea value={form.historia} onChange={e=>setForm(p=>({...p,historia:e.target.value}))} rows={3} placeholder="Cuenta la historia de tu negocio..." style={{...inp,resize:'vertical'}}/></div>
          <div><label style={lbl}>Meta de recaudación (MXN) *</label><input type="number" value={form.metaRecaudacion} disabled={metaBloq} onChange={e=>setForm(p=>({...p,metaRecaudacion:e.target.value}))} placeholder="0" style={{...inp,...(metaBloq?{background:'var(--gray-50)',cursor:'not-allowed'}:{}),...(errors.metaRecaudacion?{borderColor:'#EF4444'}:{})}}/>{metaBloq&&<p style={{margin:'3px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>No editable: campaña con fondos</p>}<Err k="metaRecaudacion"/></div>
          <div/>
          <div><label style={lbl}>Fecha de inicio</label><input type="date" value={form.fechaInicio} onChange={e=>setForm(p=>({...p,fechaInicio:e.target.value}))} style={inp}/></div>
          <div><label style={lbl}>Fecha de cierre</label><input type="date" value={form.fechaCierre} onChange={e=>setForm(p=>({...p,fechaCierre:e.target.value}))} style={inp}/></div>
        </div>
        <div style={{padding:'16px 24px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end',gap:'10px'}}>
          <button onClick={onClose} style={{padding:'10px 20px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',color:'var(--gray-700)',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{padding:'10px 24px',background:saving?'var(--gray-300)':'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:saving?'none':'0 2px 10px rgba(79,70,229,.3)'}}>
            {saving?'Guardando...':mode==='create'?'🚀 Publicar':'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TablaAdmin ───────────────────────────────────────────────────────────────
const TablaAdmin = ({ campanas, onEdit, onToggleEstado, onToggleActivo, esAdmin }) => {
  const [hovRow,setHovRow]=useState(null);
  if(!campanas.length) return <div style={{textAlign:'center',padding:'60px',color:'var(--gray-400)',fontSize:'14px',fontFamily:"'DM Sans',sans-serif"}}>No hay campañas</div>;
  return (
    <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'16px',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'var(--gray-50)',borderBottom:'1px solid var(--border)'}}>
            {['Campaña','Negocio','Progreso','Fechas','Estado','Activo','Acciones'].map(h=>(
              <th key={h} style={{padding:'12px 16px',textAlign:h==='Acciones'?'right':'left',fontSize:'11px',fontWeight:700,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:'.05em',fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:'nowrap'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campanas.map(c=>{
            const p=getPct(c.montoRecaudado,c.metaRecaudacion);
            const alc=isMeta(c);
            const [col1,col2]=getClrs(c);
            return (
              <tr key={c.id} onMouseEnter={()=>setHovRow(c.id)} onMouseLeave={()=>setHovRow(null)} style={{borderBottom:'1px solid var(--border)',background:hovRow===c.id?'var(--gray-50)':'#fff',transition:'background 120ms',opacity:c.activo?1:.55}}>
                <td style={{padding:'12px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',flexShrink:0,background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${col1},${col2})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {alc?<Trophy style={{width:'16px',height:'16px',color:'#fff'}}/>:<Megaphone style={{width:'16px',height:'16px',color:'#fff'}}/>}
                    </div>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif",maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.titulo}</div>
                      <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{c.creadoPor?.nombre} {c.creadoPor?.apellido}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 16px'}}><div style={{fontSize:'13px',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",maxWidth:'130px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.negocio?.nombreNegocio}</div></td>
                <td style={{padding:'12px 16px',minWidth:'150px'}}>
                  <div style={{height:'5px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden',marginBottom:'4px'}}>
                    <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${col1},${col2})`,width:`${p}%`}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'11px',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif"}}>{fmtM(c.montoRecaudado)}</span>
                    <span style={{fontSize:'11px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif"}}>{p}%</span>
                  </div>
                  {alc&&<div style={{fontSize:'10px',color:'#7C3AED',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginTop:'2px',display:'flex',alignItems:'center',gap:'3px'}}><Trophy style={{width:'9px',height:'9px'}}/> Meta alcanzada</div>}
                </td>
                <td style={{padding:'12px 16px'}}><div style={{fontSize:'11px',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}><div>{fmtD(c.fechaInicio)}</div><div style={{color:'var(--gray-400)'}}>→ {fmtD(c.fechaCierre)}</div></div></td>
                <td style={{padding:'12px 16px'}}><EstadoBadge campana={c}/></td>
                <td style={{padding:'12px 16px'}}><span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:c.activo?'#ECFDF5':'#FEF2F2',color:c.activo?'#065F46':'#DC2626'}}>{c.activo?'Activo':'Inactivo'}</span></td>
                <td style={{padding:'12px 16px',textAlign:'right'}}>
                  <div style={{display:'flex',gap:'4px',justifyContent:'flex-end'}}>
                    <button onClick={()=>onEdit(c)} style={{width:'32px',height:'32px',border:'none',borderRadius:'8px',background:'transparent',color:'var(--gray-400)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>{e.currentTarget.style.background='#EEF4FF';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}}><Edit2 style={{width:'14px',height:'14px'}}/></button>
                    {esAdmin&&<button onClick={e=>onToggleEstado(c,e)} style={{width:'32px',height:'32px',border:'none',borderRadius:'8px',background:'transparent',color:'var(--gray-400)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>{e.currentTarget.style.background='#EEF4FF';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}} title="Estado"><ChevronDown style={{width:'14px',height:'14px'}}/></button>}
                    {esAdmin&&<button onClick={()=>onToggleActivo(c)} style={{width:'32px',height:'32px',border:'none',borderRadius:'8px',background:'transparent',color:'var(--gray-400)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>{e.currentTarget.style.background=c.activo?'#FEF2F2':'#ECFDF5';e.currentTarget.style.color=c.activo?'#DC2626':'#065F46';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}} title={c.activo?'Desactivar':'Activar'}>{c.activo?<Ban style={{width:'14px',height:'14px'}}/>:<RotateCcw style={{width:'14px',height:'14px'}}/>}</button>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const Campanas = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage')||'{}');
  const currentUser = authStorage?.state?.user || {};

  const [campanas,  setCampanas]  = useState([]);
  const [negocios,  setNegocios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filtro,    setFiltro]    = useState('');
  const [vista,     setVista]     = useState('cards');
  const [detalle,   setDetalle]   = useState(null);
  const [apoyarCampana, setApoyarCampana] = useState(null); // modal apoyar
  const [showCampanaModal, setShowCampanaModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected,  setSelected]  = useState(null);
  const [estadoDrop,setEstadoDrop]= useState(null);

  const esAdmin  = currentUser.rol==='admin';
  const esColab  = currentUser.rol==='colaborador';
  const esCliente= currentUser.rol==='cliente';

  useEffect(()=>{ cargarDatos(); },[]);

  const cargarDatos = async()=>{
    setLoading(true);
    try {
      const [cR,nR] = await Promise.all([campanasService.getAll(), negociosService.getAll()]);
      setCampanas(cR.data||[]); setNegocios(nR.data||[]);
    } catch { toast.error('Error al cargar campañas'); }
    finally { setLoading(false); }
  };

  // Filtrado:
  // - Admin/colaborador: ve TODAS
  // - Cliente: ve las aprobadas/activas de cualquier negocio + las suyas propias en cualquier estado
  const campanasFiltradas = campanas.filter(c => {
    // Visibilidad por rol
    if (esCliente) {
      const esDueno = c.negocio?.usuarioId === currentUser.id;
      const esPublica = c.activo && (c.estado==='aprobada'||c.estado==='activa');
      if (!esDueno && !esPublica) return false;
    }
    const ms = !search || c.titulo?.toLowerCase().includes(search.toLowerCase()) || c.negocio?.nombreNegocio?.toLowerCase().includes(search.toLowerCase());
    const mf = !filtro || c.estado===filtro || (filtro==='completada' && isMeta(c));
    return ms && mf;
  });

  const handleSave = async(formData)=>{
    try {
      if(modalMode==='create'){await campanasService.create(formData);toast.success('¡Campaña publicada!');}
      else{await campanasService.update(selected.id,formData);toast.success('Campaña actualizada');}
      setShowCampanaModal(false); cargarDatos();
      if(detalle) setDetalle(prev=>({...prev,...formData}));
    } catch(e){toast.error(e?.response?.data?.message||'Error');throw e;}
  };

  const handleEstadoSelect = async(campana,est)=>{
    try{await campanasService.updateEstado(campana.id,est);toast.success(`Estado → "${ESTADO_INFO[est].label}"`);setEstadoDrop(null);cargarDatos();}
    catch{toast.error('Error');}
  };
  const handleToggleActivo = async(campana)=>{
    try{await campanasService.toggleActivo(campana.id);toast.success(campana.activo?'Desactivada':'Activada');cargarDatos();}
    catch{toast.error('Error');}
  };
  const openDrop = (campana,e)=>{ const r=e.currentTarget.getBoundingClientRect(); setEstadoDrop({campana,pos:r}); };
  const metaCount = campanas.filter(isMeta).length;

  if(loading) return(
    <Layout><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid var(--gray-200)',borderTopColor:'var(--capyme-blue-mid)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div></Layout>
  );

  // ── Vista detalle ──
  if(detalle) return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:200% 0}} @keyframes popIn{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{padding:'28px 24px',maxWidth:'1080px',margin:'0 auto'}}>
        <CampanaDetalle
          campana={detalle} currentUser={currentUser}
          onBack={()=>setDetalle(null)}
          onApoyar={()=>setApoyarCampana(detalle)}
          recargar={cargarDatos}
        />
      </div>
      {apoyarCampana && (
        <ApoyarModal
          campana={apoyarCampana}
          currentUser={currentUser}
          onClose={()=>setApoyarCampana(null)}
          onSuccess={()=>{ cargarDatos(); }}
        />
      )}
    </Layout>
  );

  return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:200% 0}} @keyframes popIn{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{padding:'32px 24px',maxWidth:'1280px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px',gap:'16px',flexWrap:'wrap'}}>
          <div>
            <h1 style={{fontSize:'28px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px'}}>Campañas de crowdfunding</h1>
            <p style={{fontSize:'14px',color:'var(--gray-500)',margin:0,fontFamily:"'DM Sans',sans-serif"}}>
              {campanasFiltradas.length} campaña{campanasFiltradas.length!==1?'s':''} · Apoya proyectos de emprendedores
              {metaCount>0&&<span style={{marginLeft:'10px',color:'#7C3AED',fontWeight:700}}>· <Trophy style={{width:'12px',height:'12px',display:'inline',verticalAlign:'middle'}}/> {metaCount} completada{metaCount!==1?'s':''}</span>}
            </p>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {(esAdmin||esColab)&&(
              <div style={{display:'flex',background:'var(--gray-100)',borderRadius:'10px',padding:'3px'}}>
                {[{v:'cards',icon:LayoutGrid},{v:'tabla',icon:Table2}].map(({v,icon:Icon})=>(
                  <button key={v} onClick={()=>setVista(v)} style={{width:'34px',height:'34px',border:'none',borderRadius:'8px',background:vista===v?'#fff':'transparent',color:vista===v?'var(--capyme-blue-mid)':'var(--gray-400)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:vista===v?'0 1px 4px rgba(0,0,0,.1)':'none',transition:'all 150ms'}}>
                    <Icon style={{width:'15px',height:'15px'}}/>
                  </button>
                ))}
              </div>
            )}
            <button onClick={()=>{setModalMode('create');setSelected(null);setShowCampanaModal(true);}} style={{padding:'10px 20px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",display:'flex',alignItems:'center',gap:'7px',boxShadow:'0 4px 14px rgba(79,70,229,.3)',letterSpacing:'.02em'}}>
              <Plus style={{width:'15px',height:'15px'}}/> Nueva campaña
            </button>
          </div>
        </div>

        {/* Stats — admin/colab */}
        {(esAdmin||esColab)&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'12px',marginBottom:'28px'}}>
            {[
              {label:'Total',value:campanas.length,color:'var(--capyme-blue-mid)'},
              {label:'Activas',value:campanas.filter(c=>c.estado==='activa'||c.estado==='aprobada').length,color:'#10B981'},
              {label:'En revisión',value:campanas.filter(c=>c.estado==='en_revision').length,color:'#F59E0B'},
              {label:'🏆 Metas logradas',value:metaCount,color:'#7C3AED'},
              {label:'Total recaudado',value:fmtM(campanas.filter(c=>c.activo).reduce((a,c)=>a+parseFloat(c.montoRecaudado||0),0)),color:'#059669'},
            ].map(s=>(
              <div key={s.label} style={{padding:'14px 16px',borderRadius:'12px',background:'#fff',border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)'}}>
                <div style={{fontSize:'18px',fontWeight:900,color:s.color,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{s.value}</div>
                <div style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{display:'flex',gap:'10px',marginBottom:'24px',flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:1,minWidth:'200px',position:'relative'}}>
            <Search style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px',color:'var(--gray-400)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar campañas..." style={{width:'100%',padding:'10px 12px 10px 36px',border:'1.5px solid var(--border)',borderRadius:'10px',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {[{v:'',l:'Todas'},...ESTADOS_LISTA.map(e=>({v:e,l:ESTADO_INFO[e].label}))].map(({v,l})=>(
              <button key={v} onClick={()=>setFiltro(v)} style={{padding:'8px 14px',borderRadius:'20px',border:filtro===v?'none':'1.5px solid var(--border)',background:filtro===v?(v==='completada'?'linear-gradient(135deg,#7C3AED,#A855F7)':'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)'):'#fff',color:filtro===v?'#fff':'var(--gray-600)',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 150ms',display:'flex',alignItems:'center',gap:'4px'}}>
                {v==='completada'&&<Trophy style={{width:'11px',height:'11px'}}/>}{l}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {campanasFiltradas.length===0?(
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <Megaphone style={{width:'48px',height:'48px',color:'var(--gray-300)',margin:'0 auto 16px',display:'block'}}/>
            <h3 style={{fontSize:'18px',fontWeight:800,color:'var(--gray-600)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 8px'}}>No hay campañas</h3>
            <p style={{fontSize:'14px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:'0 0 24px'}}>{search?'Sin resultados':'Crea la primera campaña de crowdfunding'}</p>
            <button onClick={()=>{setModalMode('create');setSelected(null);setShowCampanaModal(true);}} style={{padding:'10px 24px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 14px rgba(79,70,229,.3)'}}>+ Crear campaña</button>
          </div>
        ):vista==='tabla'&&(esAdmin||esColab)?(
          <TablaAdmin campanas={campanasFiltradas} esAdmin={esAdmin}
            onEdit={c=>{setModalMode('edit');setSelected(c);setShowCampanaModal(true);}}
            onToggleEstado={(c,e)=>openDrop(c,e)}
            onToggleActivo={handleToggleActivo}/>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
            {campanasFiltradas.map(c=>(
              <CampanaCard key={c.id} campana={c} esAdmin={esAdmin} esColab={esColab} currentUser={currentUser}
                onClick={()=>setDetalle(c)}
                onEdit={()=>{setModalMode('edit');setSelected(c);setShowCampanaModal(true);}}
                onToggleActivo={()=>handleToggleActivo(c)}
                onToggleEstado={e=>openDrop(c,e)}
                onApoyar={()=>setApoyarCampana(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Apoyar */}
      {apoyarCampana&&(
        <ApoyarModal
          campana={apoyarCampana}
          currentUser={currentUser}
          onClose={()=>setApoyarCampana(null)}
          onSuccess={cargarDatos}
        />
      )}

      {/* Modal Campaña crear/editar */}
      {showCampanaModal&&(
        <CampanaModal mode={modalMode} campana={selected}
          negocios={esCliente?negocios.filter(n=>n.usuarioId===currentUser.id&&n.activo):negocios.filter(n=>n.activo)}
          currentUser={currentUser}
          onClose={()=>setShowCampanaModal(false)}
          onSave={handleSave}/>
      )}

      {/* Dropdown estado */}
      {estadoDrop&&<EstadoDropdown campana={estadoDrop.campana} pos={estadoDrop.pos} onSelect={est=>handleEstadoSelect(estadoDrop.campana,est)} onClose={()=>setEstadoDrop(null)}/>}
    </Layout>
  );
};

export default Campanas;