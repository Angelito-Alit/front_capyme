import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Megaphone, Plus, TrendingUp, Users, Clock, Trophy, Edit2,
  ArrowRight, ChevronDown, X, CheckCircle, AlertCircle,
  Bell, Send, Eye, Target, Calendar, DollarSign, Star,
  Gift, Percent, BarChart2, FileText, Sparkles, Info,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { campanasService } from '../services/campanasService';
import { negociosService } from '../services/negociosService';

// ─── Config ───────────────────────────────────────────────────────────────────
const ESTADO_INFO = {
  en_revision: { label: 'En revisión',  bg: '#FEF9C3', color: '#854D0E', dot: '#F59E0B', desc: 'Siendo evaluada por CAPYME' },
  aprobada:    { label: 'Aprobada',     bg: '#DCFCE7', color: '#14532D', dot: '#22C55E', desc: 'Lista para activar' },
  rechazada:   { label: 'Rechazada',    bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444', desc: 'No cumple los criterios' },
  activa:      { label: 'Activa',       bg: '#DBEAFE', color: '#1E3A8A', dot: '#3B82F6', desc: 'Recibiendo inversiones' },
  pausada:     { label: 'Pausada',      bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF', desc: 'Temporalmente detenida' },
  completada:  { label: 'Completada',   bg: '#FDF4FF', color: '#581C87', dot: '#A855F7', desc: '¡Meta alcanzada!' },
  cancelada:   { label: 'Cancelada',    bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444', desc: 'Campaña cancelada' },
};

const TIPO_INFO = {
  reward:  { label: 'Recompensa',      icon: Gift,    color: '#F59E0B', bg: '#FEF9C3', desc: 'Los inversores reciben tu producto o servicio' },
  lending: { label: 'Préstamo c/interés', icon: Percent, color: '#8B5CF6', bg: '#F5F3FF', desc: 'Los inversores reciben capital + intereses' },
};

const COLORES = [
  ['#667EEA','#764BA2'], ['#11998E','#38EF7D'], ['#F093FB','#F5576C'],
  ['#4FACFE','#00F2FE'], ['#43E97B','#38F9D7'], ['#FA709A','#FEE140'],
  ['#A18CD1','#FBC2EB'], ['#0BA360','#3CBA92'],
];

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtM  = v => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v||0);
const fmtD  = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const getDias = c => { if(!c) return null; const d=Math.ceil((new Date(c)-new Date())/86400000); return d>0?d:0; };
const getPct  = (r,m) => (!m||!parseFloat(m)) ? 0 : Math.min(100,Math.round((parseFloat(r)/parseFloat(m))*100));
const isMeta  = c => parseFloat(c.metaRecaudacion||0)>0 && parseFloat(c.montoRecaudado||0)>=parseFloat(c.metaRecaudacion||1);
const getClr  = c => COLORES[(c.id||0)%COLORES.length];

// ─── EstadoBadge ──────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const info = ESTADO_INFO[estado] || ESTADO_INFO.en_revision;
  return (
    <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:700,background:info.bg,color:info.color,display:'inline-flex',alignItems:'center',gap:'5px',fontFamily:"'DM Sans',sans-serif"}}>
      <span style={{width:'6px',height:'6px',borderRadius:'50%',background:info.dot,flexShrink:0}}/>
      {info.label}
    </span>
  );
};

// ─── TipoBadge ────────────────────────────────────────────────────────────────
const TipoBadge = ({ tipo }) => {
  const info = TIPO_INFO[tipo] || TIPO_INFO.reward;
  const Icon = info.icon;
  return (
    <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:700,background:info.bg,color:info.color,display:'inline-flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',sans-serif"}}>
      <Icon style={{width:'10px',height:'10px'}}/> {info.label}
    </span>
  );
};

// ─── Modal crear/editar campaña completo ──────────────────────────────────────
const CampanaModal = ({ mode, campana, negocios, onClose, onSave }) => {
  const [form, setForm] = useState(mode === 'edit' && campana ? {
    titulo:           campana.titulo || '',
    descripcion:      campana.descripcion || '',
    historia:         campana.historia || '',
    negocioId:        campana.negocioId || '',
    metaRecaudacion:  campana.metaRecaudacion || '',
    fechaInicio:      campana.fechaInicio ? campana.fechaInicio.slice(0,10) : '',
    fechaCierre:      campana.fechaCierre ? campana.fechaCierre.slice(0,10) : '',
    tipoCrowdfunding: campana.tipoCrowdfunding || 'reward',
    recompensaDesc:   campana.recompensaDesc || '',
    interesPct:       campana.interesPct || '',
    plazoRetornoDias: campana.plazoRetornoDias || '',
    imagenUrl:        campana.imagenUrl || '',
    videoUrl:         campana.videoUrl || '',
  } : {
    titulo:'', descripcion:'', historia:'', negocioId:'',
    metaRecaudacion:'', fechaInicio:'', fechaCierre:'',
    tipoCrowdfunding:'reward', recompensaDesc:'', interesPct:'',
    plazoRetornoDias:'', imagenUrl:'', videoUrl:'',
  });
  const [tab,    setTab]    = useState('basico'); // basico | retorno | media
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const metaBloq = mode==='edit' && parseFloat(campana?.montoRecaudado||0)>0;

  const validate = () => {
    const e = {};
    if(!form.titulo||form.titulo.length<3) e.titulo='Mínimo 3 caracteres';
    if(!form.negocioId) e.negocioId='Selecciona un negocio';
    if(!form.metaRecaudacion||parseFloat(form.metaRecaudacion)<=0) e.metaRecaudacion='Meta inválida';
    if(form.tipoCrowdfunding==='lending') {
      if(!form.interesPct||parseFloat(form.interesPct)<=0) e.interesPct='Ingresa el % de interés';
      if(!form.plazoRetornoDias||parseInt(form.plazoRetornoDias)<=0) e.plazoRetornoDias='Ingresa el plazo en días';
    }
    if(form.tipoCrowdfunding==='reward' && !form.recompensaDesc) e.recompensaDesc='Describe la recompensa';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if(!validate()) { setTab(Object.keys(errors)[0]==='interesPct'||Object.keys(errors)[0]==='plazoRetornoDias'||Object.keys(errors)[0]==='recompensaDesc' ? 'retorno' : 'basico'); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inp  = (err) => ({width:'100%',padding:'10px 12px',border:`1px solid ${err?'#EF4444':'var(--border)'}`,borderRadius:'10px',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",color:'var(--gray-900)',background:'#fff',outline:'none',boxSizing:'border-box'});
  const lbl  = {display:'block',fontSize:'12px',fontWeight:700,color:'var(--gray-600)',marginBottom:'5px',fontFamily:"'DM Sans',sans-serif"};
  const Err  = ({k}) => errors[k] ? <p style={{margin:'4px 0 0',fontSize:'11px',color:'#EF4444',fontFamily:"'DM Sans',sans-serif"}}>{errors[k]}</p> : null;

  const TABS = [
    {k:'basico', label:'📋 Básico'},
    {k:'retorno', label:'💰 Retorno'},
    {k:'media', label:'🖼 Media'},
  ];

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(6px)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'24px',width:'100%',maxWidth:'660px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 32px 80px rgba(0,0,0,.25)'}}>

        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Megaphone style={{width:'20px',height:'20px',color:'#fff'}}/>
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontSize:'17px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0}}>{mode==='create'?'🚀 Nueva campaña':'✏️ Editar campaña'}</h2>
            <p style={{fontSize:'12px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Completa los 3 pasos para publicar tu proyecto</p>
          </div>
          <button onClick={onClose} style={{width:'32px',height:'32px',border:'none',background:'var(--gray-100)',borderRadius:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <X style={{width:'15px',height:'15px',color:'var(--gray-500)'}}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',padding:'0 24px',borderBottom:'1px solid var(--border)',gap:'4px'}}>
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              padding:'12px 16px',border:'none',background:'transparent',fontSize:'13px',fontWeight:700,
              color:tab===t.k?'var(--capyme-blue-mid)':'var(--gray-500)',
              cursor:'pointer',fontFamily:"'DM Sans',sans-serif",
              borderBottom:tab===t.k?'2px solid var(--capyme-blue-mid)':'2px solid transparent',
              transition:'all 150ms',
            }}>
              {t.label}
              {/* Indicador de error */}
              {((t.k==='basico'&&(errors.titulo||errors.negocioId||errors.metaRecaudacion))||(t.k==='retorno'&&(errors.recompensaDesc||errors.interesPct||errors.plazoRetornoDias)))&&(
                <span style={{marginLeft:'5px',width:'7px',height:'7px',borderRadius:'50%',background:'#EF4444',display:'inline-block',verticalAlign:'middle'}}/>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{overflowY:'auto',flex:1,padding:'24px'}}>

          {/* Tab: Básico */}
          {tab==='basico'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Título de la campaña *</label><input value={form.titulo} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} placeholder="Ej. Expansión de mi panadería artesanal" style={inp(errors.titulo)}/><Err k="titulo"/></div>
              <div style={{gridColumn:'1 / -1'}}>
                <label style={lbl}>Negocio *</label>
                <select value={form.negocioId} onChange={e=>setForm(p=>({...p,negocioId:e.target.value}))} style={{...inp(errors.negocioId),appearance:'none',cursor:'pointer'}}>
                  <option value="">Seleccionar negocio...</option>
                  {negocios.map(n=><option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}
                </select>
                <Err k="negocioId"/>
              </div>
              <div>
                <label style={lbl}>Meta de recaudación (MXN) *</label>
                <input type="number" value={form.metaRecaudacion} disabled={metaBloq} onChange={e=>setForm(p=>({...p,metaRecaudacion:e.target.value}))} placeholder="50000" style={{...inp(errors.metaRecaudacion),...(metaBloq?{background:'var(--gray-50)',cursor:'not-allowed'}:{})}}/>
                {metaBloq&&<p style={{margin:'3px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>No editable: hay fondos recibidos</p>}
                <Err k="metaRecaudacion"/>
              </div>
              <div/>
              <div><label style={lbl}>Fecha de inicio</label><input type="date" value={form.fechaInicio} onChange={e=>setForm(p=>({...p,fechaInicio:e.target.value}))} style={inp()}/></div>
              <div><label style={lbl}>Fecha de cierre</label><input type="date" value={form.fechaCierre} onChange={e=>setForm(p=>({...p,fechaCierre:e.target.value}))} style={inp()}/></div>
              <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Descripción breve (aparece en la card)</label><textarea value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} rows={2} placeholder="Resumen de tu proyecto..." style={{...inp(),resize:'vertical'}}/></div>
              <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Historia completa del proyecto</label><textarea value={form.historia} onChange={e=>setForm(p=>({...p,historia:e.target.value}))} rows={4} placeholder="Cuéntanos tu historia, tu visión, por qué necesitas este financiamiento..." style={{...inp(),resize:'vertical'}}/></div>
            </div>
          )}

          {/* Tab: Retorno */}
          {tab==='retorno'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
              {/* Selector tipo */}
              <div>
                <label style={lbl}>Tipo de crowdfunding *</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'4px'}}>
                  {Object.entries(TIPO_INFO).map(([k,info])=>{
                    const Icon=info.icon; const sel=form.tipoCrowdfunding===k;
                    return (
                      <button key={k} onClick={()=>setForm(p=>({...p,tipoCrowdfunding:k}))} style={{
                        padding:'14px',borderRadius:'14px',border:`2px solid ${sel?info.color:'var(--border)'}`,
                        background:sel?info.bg:'#fff',cursor:'pointer',textAlign:'left',
                        transition:'all 150ms',
                      }}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                          <div style={{width:'32px',height:'32px',borderRadius:'8px',background:sel?info.color+'20':info.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Icon style={{width:'16px',height:'16px',color:info.color}}/>
                          </div>
                          <span style={{fontSize:'13px',fontWeight:800,color:sel?info.color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{info.label}</span>
                          {sel&&<CheckCircle style={{width:'14px',height:'14px',color:info.color,marginLeft:'auto'}}/>}
                        </div>
                        <p style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",margin:0,lineHeight:1.4}}>{info.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos según tipo */}
              {form.tipoCrowdfunding==='reward'&&(
                <div>
                  <label style={lbl}>¿Qué recibirá el inversor? *</label>
                  <textarea value={form.recompensaDesc} onChange={e=>setForm(p=>({...p,recompensaDesc:e.target.value}))} rows={3} placeholder="Ej. Una bolsa de café artesanal de 500g + acceso anticipado a nuestra tienda en línea, enviado dentro de los 60 días de cierre de campaña." style={{...inp(errors.recompensaDesc),resize:'vertical'}}/>
                  <p style={{margin:'5px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>💡 Sé específico: producto, cantidad, fecha estimada de entrega</p>
                  <Err k="recompensaDesc"/>
                </div>
              )}

              {form.tipoCrowdfunding==='lending'&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  <div>
                    <label style={lbl}>Tasa de interés anual (%) *</label>
                    <input type="number" step="0.1" min="0" max="100" value={form.interesPct} onChange={e=>setForm(p=>({...p,interesPct:e.target.value}))} placeholder="12.5" style={inp(errors.interesPct)}/>
                    <Err k="interesPct"/>
                  </div>
                  <div>
                    <label style={lbl}>Plazo de retorno (días) *</label>
                    <input type="number" min="1" value={form.plazoRetornoDias} onChange={e=>setForm(p=>({...p,plazoRetornoDias:e.target.value}))} placeholder="365" style={inp(errors.plazoRetornoDias)}/>
                    <p style={{margin:'3px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>Ej. 365 = 1 año, 180 = 6 meses</p>
                    <Err k="plazoRetornoDias"/>
                  </div>
                  {form.interesPct&&form.metaRecaudacion&&(
                    <div style={{gridColumn:'1 / -1',padding:'12px 16px',borderRadius:'12px',background:'#F5F3FF',border:'1px solid #DDD6FE'}}>
                      <p style={{fontSize:'12px',fontWeight:700,color:'#5B21B6',fontFamily:"'DM Sans',sans-serif",margin:'0 0 4px'}}>💜 Ejemplo de retorno para un inversor de {fmtM(1000)}</p>
                      <p style={{fontSize:'13px',color:'#6D28D9',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,margin:0}}>
                        Recibe: {fmtM(1000 * (1 + parseFloat(form.interesPct||0)/100))} en {form.plazoRetornoDias||'N'} días
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Media */}
          {tab==='media'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
              <div>
                <label style={lbl}>URL de imagen de portada</label>
                <input value={form.imagenUrl} onChange={e=>setForm(p=>({...p,imagenUrl:e.target.value}))} placeholder="https://..." style={inp()}/>
                <p style={{margin:'5px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>Sube tu imagen a un servicio como Imgur, Cloudinary o Google Drive compartido</p>
                {form.imagenUrl&&(
                  <div style={{marginTop:'12px',borderRadius:'12px',overflow:'hidden',height:'160px',background:'var(--gray-100)'}}>
                    <img src={form.imagenUrl} alt="Portada" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}}/>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>URL de video (YouTube)</label>
                <input value={form.videoUrl} onChange={e=>setForm(p=>({...p,videoUrl:e.target.value}))} placeholder="https://youtube.com/watch?v=..." style={inp()}/>
                <p style={{margin:'5px 0 0',fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>Un video de presentación aumenta significativamente las conversiones 🎥</p>
                {form.videoUrl&&form.videoUrl.includes('youtube')&&(
                  <div style={{marginTop:'12px',borderRadius:'12px',overflow:'hidden',aspectRatio:'16/9',background:'#000'}}>
                    <iframe
                      width="100%" height="100%"
                      src={`https://www.youtube.com/embed/${form.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]||''}`}
                      frameBorder="0" allowFullScreen
                      style={{display:'block'}}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 24px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:'6px'}}>
            {TABS.map((t,i)=>(
              <div key={t.k} style={{width:'8px',height:'8px',borderRadius:'50%',background:tab===t.k?'var(--capyme-blue-mid)':'var(--gray-200)',transition:'all 150ms'}}/>
            ))}
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={onClose} style={{padding:'10px 20px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',color:'var(--gray-700)',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancelar</button>
            {tab!=='basico'&&<button onClick={()=>setTab(tab==='retorno'?'basico':'retorno')} style={{padding:'10px 16px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',color:'var(--gray-600)',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>← Atrás</button>}
            {tab!=='media'
              ? <button onClick={()=>setTab(tab==='basico'?'retorno':'media')} style={{padding:'10px 20px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 2px 10px rgba(79,70,229,.3)'}}>Siguiente →</button>
              : <button onClick={handleSubmit} disabled={saving} style={{padding:'10px 24px',background:saving?'var(--gray-300)':'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:saving?'none':'0 2px 10px rgba(79,70,229,.3)'}}>
                  {saving?'Guardando...':mode==='create'?'🚀 Publicar campaña':'Guardar cambios'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de actualizaciones ─────────────────────────────────────────────────
const ActualizacionModal = ({ campana, onClose, onSave }) => {
  const [titulo,   setTitulo]   = useState('');
  const [contenido,setContenido]= useState('');
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if(!titulo.trim()) { toast.error('Ingresa un título'); return; }
    if(!contenido.trim()) { toast.error('Escribe el contenido'); return; }
    setSaving(true);
    try { await onSave({ titulo, contenido }); }
    finally { setSaving(false); }
  };

  const [c1,c2] = getClr(campana);

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(6px)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'24px',width:'100%',maxWidth:'520px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.25)'}}>
        <div style={{padding:'20px 24px',background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Bell style={{width:'20px',height:'20px',color:'#fff'}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'16px',fontWeight:800,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Publicar actualización</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.75)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{campana.titulo}</div>
          </div>
          <button onClick={onClose} style={{width:'30px',height:'30px',border:'none',background:'rgba(255,255,255,.2)',borderRadius:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <X style={{width:'14px',height:'14px',color:'#fff'}}/>
          </button>
        </div>
        <div style={{padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={{display:'block',fontSize:'12px',fontWeight:700,color:'var(--gray-600)',marginBottom:'6px',fontFamily:"'DM Sans',sans-serif"}}>Título</label>
            <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej. ¡Alcanzamos el 50%! Gracias a todos" style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--border)',borderRadius:'10px',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',fontWeight:700,color:'var(--gray-600)',marginBottom:'6px',fontFamily:"'DM Sans',sans-serif"}}>Mensaje para tus inversores</label>
            <textarea value={contenido} onChange={e=>setContenido(e.target.value)} rows={5} placeholder="Comparte avances, fotos del progreso, agradecimientos o información relevante para quienes te apoyan..." style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--border)',borderRadius:'10px',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <div style={{padding:'10px 14px',borderRadius:'10px',background:'var(--capyme-blue-pale)',border:'1px solid var(--capyme-blue-mid)',display:'flex',alignItems:'center',gap:'8px'}}>
            <Info style={{width:'14px',height:'14px',color:'var(--capyme-blue-mid)',flexShrink:0}}/>
            <p style={{fontSize:'12px',color:'var(--capyme-blue-mid)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Esta actualización será visible para todos los inversores de esta campaña.</p>
          </div>
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={onClose} style={{padding:'10px 20px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',color:'var(--gray-700)',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{padding:'10px 20px',background:saving?'var(--gray-300)':`linear-gradient(135deg,${c1},${c2})`,border:'none',borderRadius:'10px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'6px',boxShadow:saving?'none':'0 2px 10px rgba(0,0,0,.15)'}}>
              <Send style={{width:'13px',height:'13px'}}/> {saving?'Enviando...':'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card de campaña propia ───────────────────────────────────────────────────
const MiCampanaCard = ({ campana:c, onEditar, onActualizar, onVerDetalle }) => {
  const [hov, setHov] = useState(false);
  const alc = isMeta(c);
  const pct = getPct(c.montoRecaudado, c.metaRecaudacion);
  const d   = getDias(c.fechaCierre);
  const [c1,c2] = getClr(c);
  const tipoInfo = TIPO_INFO[c.tipoCrowdfunding] || TIPO_INFO.reward;
  const TipoIcon = tipoInfo.icon;

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      borderRadius:'16px',border:`1.5px solid ${alc?'#A855F750':'var(--border)'}`,
      background:'#fff',overflow:'hidden',
      transition:'all 250ms cubic-bezier(.34,1.2,.64,1)',
      transform:hov?'translateY(-4px)':'none',
      boxShadow:hov?(alc?'0 16px 36px rgba(168,85,247,.2)':'0 16px 36px rgba(0,0,0,.1)'):'0 2px 8px rgba(0,0,0,.05)',
      display:'flex',flexDirection:'column', position:'relative',
    }}>
      {alc&&<div style={{position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#7C3AED)',backgroundSize:'200% 100%',animation:'shimmer 2s linear infinite',zIndex:2}}/>}

      {/* Banner */}
      <div style={{height:'100px',background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',flexShrink:0}}>
        <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.3)'}}>
          {alc?<Trophy style={{width:'24px',height:'24px',color:'#fff'}}/>:<Megaphone style={{width:'22px',height:'22px',color:'#fff'}}/>}
        </div>
        <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',gap:'5px'}}>
          <button onClick={()=>onEditar(c)} style={{padding:'5px 10px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'11px',fontWeight:600,cursor:'pointer',color:'var(--gray-700)',display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',sans-serif"}}>
            <Edit2 style={{width:'11px',height:'11px'}}/> Editar
          </button>
          <button onClick={()=>onActualizar(c)} style={{padding:'5px 10px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'11px',fontWeight:600,cursor:'pointer',color:'var(--gray-700)',display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',sans-serif"}}>
            <Bell style={{width:'11px',height:'11px'}}/> Update
          </button>
        </div>
        <div style={{position:'absolute',bottom:'10px',left:'16px',display:'flex',gap:'5px'}}>
          <EstadoBadge estado={c.estado}/>
          <TipoBadge tipo={c.tipoCrowdfunding}/>
        </div>
      </div>

      {/* Body */}
      <div style={{padding:'14px 16px',flex:1,display:'flex',flexDirection:'column',gap:'12px'}}>
        <div>
          <h3 style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 3px',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.titulo}</h3>
          <p style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>{c.negocio?.nombreNegocio}</p>
        </div>

        {/* Barra progreso */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
            <span style={{fontSize:'15px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(c.montoRecaudado)}</span>
            <span style={{fontSize:'12px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{pct}%</span>
          </div>
          <div style={{height:'7px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`,width:`${pct}%`,transition:'width 900ms ease',boxShadow:alc?'0 0 8px rgba(168,85,247,.5)':'none'}}/>
          </div>
          <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",marginTop:'3px'}}>de {fmtM(c.metaRecaudacion)} meta</div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',borderTop:'1px solid var(--gray-100)',paddingTop:'10px'}}>
          {[
            {icon:Users,v:c._count?.inversiones??c.inversiones?.length??0,l:'inversores'},
            {icon:Clock,v:d===null?'—':d===0?'0':d,l:'días',red:d!==null&&d<=7&&d>0},
            {icon:TipoIcon,v:c.tipoCrowdfunding==='lending'?`${c.interesPct||0}%`:'🎁',l:c.tipoCrowdfunding==='lending'?'interés':'reward'},
          ].map(({icon:Icon,v,l,red})=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:'14px',fontWeight:800,color:red?'#EF4444':'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{v}</div>
              <div style={{fontSize:'10px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'.03em'}}>{l}</div>
            </div>
          ))}
        </div>

        <button onClick={()=>onVerDetalle(c)} style={{width:'100%',padding:'9px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',transition:'all 150ms'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--gray-50)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#fff';}}>
          <Eye style={{width:'13px',height:'13px'}}/> Ver detalle & inversores
        </button>
      </div>
    </div>
  );
};

// ─── Vista detalle de mi campaña ──────────────────────────────────────────────
const DetalleMiCampana = ({ campana:c, onBack, onActualizar, onEditar }) => {
  const [inversores, setInversores] = useState([]);
  const [updates,    setUpdates]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const alc = isMeta(c);
  const [c1,c2] = getClr(c);
  const pct = getPct(c.montoRecaudado, c.metaRecaudacion);
  const tipoInfo = TIPO_INFO[c.tipoCrowdfunding]||TIPO_INFO.reward;
  const TipoIcon = tipoInfo.icon;

  useEffect(()=>{
    Promise.all([
      fetch(`/api/inversiones?campanaId=${c.id}`,{headers:{Authorization:`Bearer ${JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token}`}}).then(r=>r.json()),
      // actualizaciones si el endpoint existe
    ]).then(([invRes])=>{
      setInversores((invRes.data||[]).filter(i=>i.estadoPago==='confirmado'&&i.activo));
    }).catch(()=>{})
    .finally(()=>setLoading(false));
  },[c.id]);

  const totalConfirmado = inversores.reduce((a,i)=>a+parseFloat(i.monto||0),0);

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',paddingBottom:'48px'}}>
      <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 0',background:'none',border:'none',color:'var(--gray-500)',fontSize:'13px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginBottom:'20px'}}>
        ← Volver a mis campañas
      </button>

      {/* Hero */}
      <div style={{borderRadius:'20px',marginBottom:'24px',overflow:'hidden'}}>
        {c.imagenUrl ? (
          <div style={{position:'relative',height:'240px'}}>
            <img src={c.imagenUrl} alt={c.titulo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7),transparent)'}}/>
            <div style={{position:'absolute',bottom:'24px',left:'24px',right:'24px'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}><EstadoBadge estado={c.estado}/><TipoBadge tipo={c.tipoCrowdfunding}/></div>
              <h1 style={{fontSize:'24px',fontWeight:900,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0,textShadow:'0 2px 8px rgba(0,0,0,.3)'}}>{c.titulo}</h1>
            </div>
          </div>
        ) : (
          <div style={{height:'200px',background:alc?'linear-gradient(135deg,#7C3AED,#A855F7)':`linear-gradient(135deg,${c1},${c2})`,position:'relative',display:'flex',alignItems:'flex-end',padding:'24px'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.4),transparent)'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}><EstadoBadge estado={c.estado}/><TipoBadge tipo={c.tipoCrowdfunding}/></div>
              <h1 style={{fontSize:'24px',fontWeight:900,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0,textShadow:'0 2px 8px rgba(0,0,0,.2)'}}>{c.titulo}</h1>
            </div>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'24px',alignItems:'start'}}>
        {/* Col izq */}
        <div>
          {/* Video */}
          {c.videoUrl&&c.videoUrl.includes('youtube')&&(
            <div style={{marginBottom:'24px',borderRadius:'14px',overflow:'hidden',aspectRatio:'16/9'}}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${c.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]||''}`} frameBorder="0" allowFullScreen style={{display:'block'}}/>
            </div>
          )}

          {/* Stats de la campaña */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'24px'}}>
            {[
              {icon:DollarSign,label:'Recaudado',value:fmtM(totalConfirmado),color:'#10B981'},
              {icon:Users,label:'Inversores',value:inversores.length,color:'var(--capyme-blue-mid)'},
              {icon:Target,label:'Meta',value:fmtM(c.metaRecaudacion),color:'#8B5CF6'},
              {icon:TipoIcon,label:c.tipoCrowdfunding==='lending'?'Interés':'Tipo',value:c.tipoCrowdfunding==='lending'?`${c.interesPct||0}% anual`:'Reward',color:tipoInfo.color},
            ].map(({icon:Icon,label,value,color})=>(
              <div key={label} style={{padding:'12px',borderRadius:'12px',background:'#fff',border:'1px solid var(--border)',textAlign:'center',boxShadow:'var(--shadow-sm)'}}>
                <Icon style={{width:'16px',height:'16px',color,margin:'0 auto 5px',display:'block'}}/>
                <div style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{value}</div>
                <div style={{fontSize:'10px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Descripción y retorno */}
          {c.descripcion&&(
            <div style={{marginBottom:'20px'}}>
              <h3 style={{fontSize:'15px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 8px'}}>Sobre el proyecto</h3>
              <p style={{fontSize:'14px',color:'var(--gray-600)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif",margin:0}}>{c.descripcion}</p>
            </div>
          )}

          {/* Retorno/recompensa */}
          <div style={{padding:'16px',borderRadius:'14px',background:tipoInfo.bg,border:`1px solid ${tipoInfo.color}30`,marginBottom:'24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
              <TipoIcon style={{width:'16px',height:'16px',color:tipoInfo.color}}/>
              <h3 style={{fontSize:'14px',fontWeight:800,color:tipoInfo.color,fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0}}>{tipoInfo.label}</h3>
            </div>
            {c.tipoCrowdfunding==='reward'&&c.recompensaDesc&&(
              <p style={{fontSize:'13px',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",margin:0,lineHeight:1.6}}>{c.recompensaDesc}</p>
            )}
            {c.tipoCrowdfunding==='lending'&&(
              <p style={{fontSize:'13px',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif",margin:0}}>
                Tasa: <strong>{c.interesPct}%</strong> anual · Plazo: <strong>{c.plazoRetornoDias} días</strong>
              </p>
            )}
          </div>

          {/* Lista de inversores */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
            <h3 style={{fontSize:'15px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0}}>
              Inversores ({inversores.length})
            </h3>
            <button onClick={()=>onActualizar(c)} style={{padding:'7px 14px',background:`linear-gradient(135deg,${c1},${c2})`,border:'none',borderRadius:'8px',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}>
              <Bell style={{width:'13px',height:'13px'}}/> Publicar actualización
            </button>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'32px',color:'var(--gray-400)',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"}}>Cargando...</div>
          ) : inversores.length===0 ? (
            <div style={{padding:'32px',borderRadius:'14px',border:'2px dashed var(--border)',textAlign:'center'}}>
              <Users style={{width:'32px',height:'32px',color:'var(--gray-300)',margin:'0 auto 10px',display:'block'}}/>
              <p style={{fontSize:'13px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:0}}>Aún no hay inversores confirmados</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {inversores.map((inv,i)=>{
                const ini=`${inv.inversor?.nombre?.[0]||''}${inv.inversor?.apellido?.[0]||''}`.toUpperCase();
                return (
                  <div key={inv.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'12px',background:i===0?'linear-gradient(135deg,var(--capyme-blue-pale),#F0FDF4)':'var(--gray-50)',border:`1px solid ${i===0?'var(--capyme-blue-mid)':'var(--border)'}`}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px',fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>{ini}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'6px'}}>
                        {inv.inversor?.nombre} {inv.inversor?.apellido}
                        {i===0&&<span style={{fontSize:'10px',background:'var(--capyme-blue-mid)',color:'#fff',padding:'1px 6px',borderRadius:'4px',fontWeight:700}}>TOP</span>}
                      </div>
                      <div style={{fontSize:'11px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif"}}>{fmtD(inv.fechaCreacion)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'14px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(inv.monto)}</div>
                      {c.tipoCrowdfunding==='lending'&&c.interesPct&&(
                        <div style={{fontSize:'10px',color:'#8B5CF6',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                          Retorno: {fmtM(parseFloat(inv.monto)*(1+parseFloat(c.interesPct)/100))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div style={{position:'sticky',top:'20px'}}>
          <div style={{borderRadius:'16px',border:`1.5px solid ${alc?'#A855F750':'var(--border)'}`,background:'#fff',padding:'20px',boxShadow:'0 4px 20px rgba(0,0,0,.08)'}}>
            <div style={{marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
                <span style={{fontSize:'22px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtM(c.montoRecaudado)}</span>
                <span style={{fontSize:'13px',fontWeight:700,color:alc?'#7C3AED':'var(--capyme-blue-mid)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{pct}%</span>
              </div>
              <div style={{fontSize:'12px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",marginBottom:'8px'}}>de {fmtM(c.metaRecaudacion)} meta</div>
              <div style={{height:'10px',borderRadius:'99px',background:'var(--gray-100)',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:'99px',background:alc?'linear-gradient(90deg,#7C3AED,#A855F7)':`linear-gradient(90deg,${c1},${c2})`,width:`${pct}%`,transition:'width 1s ease',boxShadow:alc?'0 0 8px rgba(168,85,247,.5)':'none'}}/>
              </div>
            </div>
            {alc&&(
              <div style={{padding:'12px',borderRadius:'12px',background:'linear-gradient(135deg,#7C3AED15,#A855F715)',border:'1.5px solid #A855F750',textAlign:'center',marginBottom:'14px'}}>
                <Trophy style={{width:'20px',height:'20px',color:'#7C3AED',margin:'0 auto 4px',display:'block'}}/>
                <div style={{fontSize:'13px',fontWeight:800,color:'#581C87',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>¡Meta alcanzada!</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <button onClick={()=>onEditar(c)} style={{width:'100%',padding:'10px',border:'1.5px solid var(--border)',borderRadius:'10px',background:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',color:'var(--gray-700)'}}>
                <Edit2 style={{width:'13px',height:'13px'}}/> Editar campaña
              </button>
              <button onClick={()=>onActualizar(c)} style={{width:'100%',padding:'10px',background:`linear-gradient(135deg,${c1},${c2})`,border:'none',borderRadius:'10px',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}>
                <Bell style={{width:'13px',height:'13px'}}/> Publicar actualización
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const MisCampanas = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage')||'{}');
  const currentUser = authStorage?.state?.user || {};

  const [campanas,  setCampanas]  = useState([]);
  const [negocios,  setNegocios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [detalle,   setDetalle]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected,  setSelected]  = useState(null);
  const [actUpdate, setActUpdate] = useState(null); // campana para actualización

  useEffect(()=>{ cargarDatos(); },[]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [cR,nR] = await Promise.all([campanasService.getMias(), negociosService.getAll()]);
      setCampanas(cR.data||[]); setNegocios(nR.data||[]);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    try {
      if(modalMode==='create'){ await campanasService.create(formData); toast.success('¡Campaña publicada! Estará en revisión.'); }
      else { await campanasService.update(selected.id,formData); toast.success('Campaña actualizada'); }
      setShowModal(false); setDetalle(null); cargarDatos();
    } catch(e){ toast.error(e?.response?.data?.message||'Error'); throw e; }
  };

  const handleActualizacion = async ({ titulo, contenido }) => {
    try {
      await campanasService.publicarActualizacion(actUpdate.id, { titulo, contenido });
      toast.success('✅ Actualización publicada — tus inversores la verán');
      setActUpdate(null);
    } catch { toast.error('Error al publicar'); }
  };

  const negociosPropios = negocios.filter(n => n.usuarioId === currentUser.id && n.activo);

  // Métricas
  const totalRecaudado = campanas.reduce((a,c)=>a+parseFloat(c.montoRecaudado||0),0);
  const activas = campanas.filter(c=>c.estado==='activa'||c.estado==='aprobada').length;
  const completadas = campanas.filter(isMeta).length;

  if(loading) return(
    <Layout><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid var(--gray-200)',borderTopColor:'var(--capyme-blue-mid)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div></Layout>
  );

  if(detalle) return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:200% 0}}`}</style>
      <div style={{padding:'28px 24px',maxWidth:'1080px',margin:'0 auto'}}>
        <DetalleMiCampana campana={detalle} onBack={()=>setDetalle(null)} onEditar={c=>{setModalMode('edit');setSelected(c);setShowModal(true);}} onActualizar={setActUpdate}/>
      </div>
      {actUpdate&&<ActualizacionModal campana={actUpdate} onClose={()=>setActUpdate(null)} onSave={handleActualizacion}/>}
      {showModal&&<CampanaModal mode={modalMode} campana={selected} negocios={negociosPropios} onClose={()=>setShowModal(false)} onSave={handleSave}/>}
    </Layout>
  );

  return(
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:200% 0}}`}</style>
      <div style={{padding:'32px 24px',maxWidth:'1280px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px',gap:'16px',flexWrap:'wrap'}}>
          <div>
            <h1 style={{fontSize:'28px',fontWeight:900,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 6px'}}>Mis campañas</h1>
            <p style={{fontSize:'14px',color:'var(--gray-500)',margin:0,fontFamily:"'DM Sans',sans-serif"}}>Gestiona y sigue el progreso de tus proyectos de financiamiento</p>
          </div>
          <button onClick={()=>{setModalMode('create');setSelected(null);setShowModal(true);}} style={{padding:'11px 22px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",display:'flex',alignItems:'center',gap:'7px',boxShadow:'0 4px 14px rgba(79,70,229,.3)',letterSpacing:'.02em'}}>
            <Plus style={{width:'15px',height:'15px'}}/> Nueva campaña
          </button>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'12px',marginBottom:'28px'}}>
          {[
            {icon:Megaphone,  label:'Mis campañas',     value:campanas.length,         color:'var(--capyme-blue-mid)'},
            {icon:TrendingUp, label:'Activas',           value:activas,                 color:'#10B981'},
            {icon:Trophy,     label:'Completadas',       value:completadas,             color:'#7C3AED'},
            {icon:DollarSign, label:'Total recaudado',   value:fmtM(totalRecaudado),    color:'#059669'},
          ].map(({icon:Icon,label,value,color})=>(
            <div key={label} style={{padding:'16px',borderRadius:'14px',background:'#fff',border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'9px',background:color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon style={{width:'16px',height:'16px',color}}/>
                </div>
              </div>
              <div style={{fontSize:'20px',fontWeight:900,color,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{value}</div>
              <div style={{fontSize:'11px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",marginTop:'2px'}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Aviso estado revisión */}
        {campanas.some(c=>c.estado==='en_revision')&&(
          <div style={{padding:'12px 16px',borderRadius:'12px',marginBottom:'20px',background:'#FEF9C3',border:'1px solid #FDE68A',display:'flex',alignItems:'center',gap:'10px'}}>
            <AlertCircle style={{width:'16px',height:'16px',color:'#D97706',flexShrink:0}}/>
            <span style={{fontSize:'13px',fontFamily:"'DM Sans',sans-serif",color:'#92400E',fontWeight:600}}>
              Tienes {campanas.filter(c=>c.estado==='en_revision').length} campaña(s) pendiente(s) de revisión por CAPYME.
            </span>
          </div>
        )}

        {/* Campañas grid */}
        {campanas.length===0 ? (
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <Megaphone style={{width:'56px',height:'56px',color:'var(--gray-200)',margin:'0 auto 16px',display:'block'}}/>
            <h3 style={{fontSize:'20px',fontWeight:800,color:'var(--gray-600)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 8px'}}>Aún no tienes campañas</h3>
            <p style={{fontSize:'14px',color:'var(--gray-400)',fontFamily:"'DM Sans',sans-serif",margin:'0 0 28px',maxWidth:'380px',marginLeft:'auto',marginRight:'auto'}}>
              Crea tu primera campaña de crowdfunding para empezar a recibir financiamiento de inversores
            </p>
            <button onClick={()=>{setModalMode('create');setSelected(null);setShowModal(true);}} style={{padding:'12px 28px',background:'linear-gradient(135deg,var(--capyme-blue-mid),#4F46E5)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 16px rgba(79,70,229,.3)',display:'inline-flex',alignItems:'center',gap:'8px'}}>
              <Sparkles style={{width:'16px',height:'16px'}}/> Crear mi primera campaña
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
            {campanas.map(c=>(
              <MiCampanaCard key={c.id} campana={c}
                onEditar={c=>{setModalMode('edit');setSelected(c);setShowModal(true);}}
                onActualizar={setActUpdate}
                onVerDetalle={setDetalle}
              />
            ))}
          </div>
        )}
      </div>

      {showModal&&<CampanaModal mode={modalMode} campana={selected} negocios={negociosPropios} onClose={()=>setShowModal(false)} onSave={handleSave}/>}
      {actUpdate&&<ActualizacionModal campana={actUpdate} onClose={()=>setActUpdate(null)} onSave={handleActualizacion}/>}
    </Layout>
  );
};

export default MisCampanas;