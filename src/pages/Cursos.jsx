import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { cursosService } from '../services/cursosService';
import {
  GraduationCap, Plus, Search, Edit, CheckCircle, Trash2, X,
  Calendar, Users, Clock, DollarSign, Monitor, MapPin, Layers,
  AlertCircle, ChevronDown, LayoutGrid, List, BookOpen, User, AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialForm = { titulo: '', descripcion: '', instructor: '', duracionHoras: '', modalidad: 'online', fechaInicio: '', fechaFin: '', cupoMaximo: '', costo: '' };

const ConfirmModal = ({ config, onClose }) => {
  if (!config?.show) return null;
  const d = config.variant === 'danger', w = config.variant === 'warning';
  const bg    = d ? '#FEF2F2' : w ? '#FFFBEB' : '#EEF4FF';
  const bo    = d ? '#FECACA' : w ? '#FDE68A' : 'var(--border)';
  const ic    = d ? '#EF4444' : w ? '#F59E0B' : 'var(--capyme-blue-mid)';
  const tc    = d ? '#B91C1C' : w ? '#92400E' : 'var(--gray-900)';
  const sc    = d ? '#DC2626' : w ? '#B45309' : 'var(--gray-500)';
  const btn   = d ? 'linear-gradient(135deg,#EF4444,#DC2626)' : w ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))';
  const bsh   = d ? '0 2px 8px rgba(239,68,68,0.35)' : w ? '0 2px 8px rgba(245,158,11,0.35)' : '0 2px 8px rgba(31,78,158,0.28)';
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1200,padding:'20px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:'var(--radius-lg)',width:'100%',maxWidth:'420px',boxShadow:'0 24px 64px rgba(0,0,0,0.22)',overflow:'hidden',animation:'modalIn 0.22s ease both' }}>
        <div style={{ background:bg,padding:'20px 24px',borderBottom:`1px solid ${bo}`,display:'flex',alignItems:'center',gap:'14px' }}>
          <div style={{ width:'44px',height:'44px',background:ic,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <AlertTriangle style={{ width:'22px',height:'22px',color:'#fff' }} />
          </div>
          <div>
            <h3 style={{ fontSize:'17px',fontWeight:800,color:tc,fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 2px' }}>{config.title}</h3>
            <p style={{ fontSize:'13px',color:sc,margin:0,fontFamily:"'DM Sans',sans-serif" }}>{config.subtitle||''}</p>
          </div>
        </div>
        <div style={{ padding:'20px 24px' }}>
          {config.message&&<div style={{ background:'var(--gray-50)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'14px 16px',marginBottom:'20px' }}><p style={{ fontSize:'14px',color:'var(--gray-700)',margin:0,lineHeight:1.5 }}>{config.message}</p></div>}
          <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'9px 18px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',background:'#fff',color:'var(--gray-700)',fontSize:'14px',fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Cancelar</button>
            <button onClick={()=>{config.onConfirm();onClose();}} style={{ padding:'9px 22px',border:'none',borderRadius:'var(--radius-md)',background:btn,color:'#fff',fontSize:'14px',fontWeight:600,cursor:'pointer',boxShadow:bsh }}>{config.confirmLabel||'Confirmar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cursos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage')||'{}');
  const currentUser = authStorage?.state?.user||{};

  const [cursos,               setCursos]               = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [submitting,           setSubmitting]           = useState(false);
  const [showModal,            setShowModal]            = useState(false);
  const [showInscritosModal,   setShowInscritosModal]   = useState(false);
  const [modalMode,            setModalMode]            = useState('create');
  const [selectedCurso,        setSelectedCurso]        = useState(null);
  const [inscritos,            setInscritos]            = useState([]);
  const [inscritosTitulo,      setInscritosTitulo]      = useState('');
  const [searchTerm,           setSearchTerm]           = useState('');
  const [filterModalidad,      setFilterModalidad]      = useState('');
  const [filterEstado,         setFilterEstado]         = useState('');
  const [viewMode,             setViewMode]             = useState('grid');
  const [hoveredRow,           setHoveredRow]           = useState(null);
  const [formData,             setFormData]             = useState(initialForm);
  const [formErrors,           setFormErrors]           = useState({});
  const [confirmConfig,        setConfirmConfig]        = useState({ show:false });

  const showConfirm = (cfg) => setConfirmConfig({ show:true,...cfg });
  const closeConfirm= () => setConfirmConfig({ show:false });

  const inputBase  = { width:'100%',padding:'10px 12px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",color:'var(--gray-900)',background:'#fff',outline:'none',transition:'all 200ms ease',boxSizing:'border-box' };
  const inputIcon  = { ...inputBase, paddingLeft:'38px' };
  const inputErr   = { borderColor:'#EF4444', boxShadow:'0 0 0 2px rgba(239,68,68,0.15)' };
  const labelSt    = { display:'block',fontSize:'13px',fontWeight:600,color:'var(--gray-600)',marginBottom:'6px',fontFamily:"'DM Sans',sans-serif" };
  const selectSt   = { ...inputBase, appearance:'none', paddingRight:'36px', cursor:'pointer' };
  const textareaSt = { ...inputBase, resize:'vertical', minHeight:'80px' };

  useEffect(()=>{ cargarCursos(); },[filterModalidad,filterEstado]); // eslint-disable-line

  const cargarCursos = async () => {
    try { setLoading(true); const p={}; if(filterModalidad)p.modalidad=filterModalidad; if(filterEstado!=='')p.activo=filterEstado; const r=await cursosService.getAll(p); setCursos(r.data); }
    catch { toast.error('Error al cargar cursos'); } finally { setLoading(false); }
  };

  const validateForm = () => {
    const e={};
    if(!formData.titulo.trim()) e.titulo='El título es requerido';
    if(formData.fechaInicio&&formData.fechaFin&&formData.fechaInicio>formData.fechaFin) e.fechaFin='La fecha de fin debe ser posterior al inicio';
    if(formData.costo!==''&&isNaN(parseFloat(formData.costo))) e.costo='Ingresa un costo válido';
    if(formData.duracionHoras!==''&&isNaN(parseInt(formData.duracionHoras))) e.duracionHoras='Número inválido';
    setFormErrors(e); return Object.keys(e).length===0;
  };

  const isFormValid = formData.titulo.trim()!==''&&(!formData.fechaInicio||!formData.fechaFin||formData.fechaInicio<=formData.fechaFin)&&(formData.costo===''||!isNaN(parseFloat(formData.costo)))&&(formData.duracionHoras===''||!isNaN(parseInt(formData.duracionHoras)));

  const handleOpenModal = (mode, curso=null) => {
    setModalMode(mode); setSelectedCurso(curso); setFormErrors({});
    mode==='edit'&&curso ? setFormData({ titulo:curso.titulo||'', descripcion:curso.descripcion||'', instructor:curso.instructor||'', duracionHoras:curso.duracionHoras!=null?String(curso.duracionHoras):'', modalidad:curso.modalidad||'online', fechaInicio:curso.fechaInicio?curso.fechaInicio.split('T')[0]:'', fechaFin:curso.fechaFin?curso.fechaFin.split('T')[0]:'', cupoMaximo:curso.cupoMaximo!=null?String(curso.cupoMaximo):'', costo:curso.costo!=null?String(curso.costo):'' }) : setFormData(initialForm);
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedCurso(null); setFormErrors({}); };

  const handleChange = (e) => {
    const {name,value}=e.target; setFormData(p=>({...p,[name]:value}));
    if(formErrors[name]) setFormErrors(p=>({...p,[name]:''}));
  };

  const handleSubmit = async () => {
    if(!validateForm()) return; setSubmitting(true);
    try {
      const d={ ...formData, duracionHoras:formData.duracionHoras!==''?parseInt(formData.duracionHoras):null, cupoMaximo:formData.cupoMaximo!==''?parseInt(formData.cupoMaximo):null, costo:formData.costo!==''?parseFloat(formData.costo):0, fechaInicio:formData.fechaInicio||null, fechaFin:formData.fechaFin||null };
      modalMode==='create' ? await cursosService.create(d) : await cursosService.update(selectedCurso.id,d);
      toast.success(modalMode==='create'?'Curso creado':'Curso actualizado');
      handleCloseModal(); cargarCursos();
    } catch(e){ toast.error(e.response?.data?.message||'Error al guardar'); } finally { setSubmitting(false); }
  };

  const handleToggle = (curso) => {
    const d=curso.activo;
    showConfirm({ variant:d?'danger':'warning', title:d?'Desactivar curso':'Activar curso', subtitle:d?'Dejará de estar disponible':'Volverá a ser visible', message:`¿Confirmas ${d?'desactivar':'activar'} "${curso.titulo}"?`, confirmLabel:d?'Sí, desactivar':'Sí, activar',
      onConfirm:async()=>{ try{ await cursosService.toggleActivo(curso.id); toast.success(`Curso ${d?'desactivado':'activado'}`); cargarCursos(); }catch{ toast.error('Error al cambiar estado'); } } });
  };

  const cargarInscritos = async (curso) => {
    try { const r=await cursosService.getInscritos(curso.id); setInscritos(r.data); setInscritosTitulo(curso.titulo); setShowInscritosModal(true); }
    catch { toast.error('Error al cargar inscritos'); }
  };

  const filtrados = cursos.filter(c=>c.titulo.toLowerCase().includes(searchTerm.toLowerCase())||(c.instructor||'').toLowerCase().includes(searchTerm.toLowerCase()));
  const fmt    = (a) => a!=null?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(a):null;
  const fmtDate= (d) => d?new Date(d).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'}):null;
  const getMStyle=(m)=>({online:{bg:'#EEF4FF',color:'var(--capyme-blue-mid)'},presencial:{bg:'#F0FDF4',color:'#16A34A'},hibrido:{bg:'#F5F3FF',color:'#7C3AED'}}[m]||{bg:'var(--gray-100)',color:'var(--gray-600)'});
  const getMIcon =(m)=>m==='presencial'?MapPin:m==='hibrido'?Layers:Monitor;
  const getMLabel=(m)=>({online:'Online',presencial:'Presencial',hibrido:'Híbrido'}[m]||m);
  const getEstStyle=(e)=>({inscrito:{bg:'#EEF4FF',color:'var(--capyme-blue-mid)'},en_curso:{bg:'#FFF7ED',color:'#C2410C'},completado:{bg:'#ECFDF5',color:'#065F46'},abandonado:{bg:'#FEF2F2',color:'#DC2626'}}[e]||{bg:'var(--gray-100)',color:'var(--gray-600)'});

  if(loading) return (<Layout><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',flexDirection:'column',gap:'16px'}}><div style={{width:'40px',height:'40px',border:'3px solid var(--gray-200)',borderTopColor:'var(--capyme-blue-mid)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style></div></Layout>);

  return (
    <Layout>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .curso-card{animation:fadeInUp 0.3s ease both;transition:box-shadow 200ms,transform 200ms;}
        .curso-card:hover{box-shadow:0 8px 24px rgba(31,78,158,0.10);transform:translateY(-2px);}
        .curso-modal{animation:modalIn 0.25s ease both;}
      `}</style>

      <div style={{ padding:'0 0 40px' }}>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'16px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
            <div style={{ width:'46px',height:'46px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(31,78,158,0.25)' }}><GraduationCap style={{ width:'22px',height:'22px',color:'#fff' }}/></div>
            <div>
              <h1 style={{ fontSize:'22px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0 }}>Cursos de Capacitación</h1>
              <p style={{ fontSize:'13px',color:'var(--gray-500)',margin:'3px 0 0',fontFamily:"'DM Sans',sans-serif" }}>{cursos.length} curso{cursos.length!==1?'s':''} · Pagos automáticos vía Mercado Pago</p>
            </div>
          </div>
          {currentUser.rol!=='cliente'&&(
            <button onClick={()=>handleOpenModal('create')} style={{ display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',boxShadow:'0 2px 8px rgba(31,78,158,0.28)',transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.opacity='0.9';e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='translateY(0)';}}>
              <Plus style={{ width:'16px',height:'16px' }}/> Nuevo Curso
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'12px',marginBottom:'20px' }}>
          {[{l:'Total',v:cursos.length,c:'var(--capyme-blue-mid)',b:'var(--capyme-blue-pale)'},{l:'Activos',v:cursos.filter(c=>c.activo).length,c:'#16A34A',b:'#F0FDF4'},{l:'Inactivos',v:cursos.filter(c=>!c.activo).length,c:'#DC2626',b:'#FEF2F2'},{l:'Gratuitos',v:cursos.filter(c=>!c.costo||parseFloat(c.costo)===0).length,c:'#7C3AED',b:'#F5F3FF'}].map(s=>(
            <div key={s.l} style={{ background:s.b,borderRadius:'var(--radius-md)',padding:'14px 16px',display:'flex',alignItems:'center',gap:'10px' }}>
              <span style={{ fontSize:'22px',fontWeight:800,color:s.c,fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1 }}>{s.v}</span>
              <span style={{ fontSize:'12px',color:s.c,fontFamily:"'DM Sans',sans-serif",fontWeight:600,opacity:0.75 }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'16px 20px',marginBottom:'20px',display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap',boxShadow:'var(--shadow-sm)' }}>
          <div style={{ position:'relative',flex:1,minWidth:'180px' }}>
            <Search style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'15px',height:'15px',color:'var(--gray-400)',pointerEvents:'none' }}/>
            <input type="text" placeholder="Buscar…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={inputIcon}/>
          </div>
          <div style={{ position:'relative',minWidth:'160px' }}>
            <select value={filterModalidad} onChange={e=>setFilterModalidad(e.target.value)} style={{ ...selectSt,width:'100%' }}>
              <option value="">Todas las modalidades</option><option value="online">Online</option><option value="presencial">Presencial</option><option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/>
          </div>
          <div style={{ position:'relative',minWidth:'140px' }}>
            <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value)} style={{ ...selectSt,width:'100%' }}>
              <option value="">Activo/Inactivo</option><option value="true">Activos</option><option value="false">Inactivos</option>
            </select>
            <ChevronDown style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/>
          </div>
          <div style={{ display:'flex',gap:'4px',background:'var(--gray-100)',borderRadius:'var(--radius-sm)',padding:'3px',marginLeft:'auto' }}>
            {[{m:'grid',I:LayoutGrid},{m:'list',I:List}].map(({m,I})=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{ width:'32px',height:'32px',border:'none',borderRadius:'var(--radius-sm)',background:viewMode===m?'#fff':'transparent',color:viewMode===m?'var(--capyme-blue-mid)':'var(--gray-400)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 150ms' }}>
                <I style={{ width:'15px',height:'15px' }}/>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {filtrados.length===0?(
          <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'60px 20px',textAlign:'center' }}>
            <GraduationCap style={{ width:'28px',height:'28px',color:'var(--gray-300)',margin:'0 auto 12px',display:'block' }}/>
            <p style={{ fontSize:'15px',fontWeight:600,color:'var(--gray-700)',margin:'0 0 6px',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>No se encontraron cursos</p>
          </div>

        ):viewMode==='grid'?(
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px' }}>
            {filtrados.map((curso,idx)=>{
              const ms=getMStyle(curso.modalidad),MI=getMIcon(curso.modalidad),esG=!curso.costo||parseFloat(curso.costo)===0;
              return(
                <div key={curso.id} className="curso-card" style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden',animationDelay:`${idx*40}ms`,opacity:curso.activo?1:0.65 }}>
                  <div style={{ height:'4px',background:curso.activo?'linear-gradient(90deg,var(--capyme-blue-mid),var(--capyme-blue))':'var(--gray-200)' }}/>
                  <div style={{ padding:'20px' }}>
                    <h3 style={{ fontSize:'15px',fontWeight:700,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:'0 0 8px',lineHeight:1.3 }}>{curso.titulo}</h3>
                    <div style={{ display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px' }}>
                      <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:ms.bg,color:ms.color,fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:'uppercase',letterSpacing:'0.04em' }}><MI style={{ width:'9px',height:'9px' }}/>{getMLabel(curso.modalidad)}</span>
                      <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:esG?'#ECFDF5':'#EFF8FF',color:esG?'#065F46':'#0369A1',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{esG?'Gratis':fmt(curso.costo)}</span>
                      <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:curso.activo?'#ECFDF5':'#FEF2F2',color:curso.activo?'#065F46':'#DC2626',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{curso.activo?'● Activo':'● Inactivo'}</span>
                    </div>
                    {curso.descripcion&&<p style={{ fontSize:'13px',color:'var(--gray-500)',margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{curso.descripcion}</p>}
                    <div style={{ display:'flex',flexDirection:'column',gap:'7px',marginBottom:'16px' }}>
                      {curso.instructor   &&<div style={{ display:'flex',alignItems:'center',gap:'7px' }}><User     style={{ width:'13px',height:'13px',color:'var(--gray-400)',flexShrink:0 }}/><span style={{ fontSize:'13px',color:'var(--gray-700)',fontFamily:"'DM Sans',sans-serif" }}>{curso.instructor}</span></div>}
                      {curso.duracionHoras&&<div style={{ display:'flex',alignItems:'center',gap:'7px' }}><Clock    style={{ width:'13px',height:'13px',color:'var(--gray-400)',flexShrink:0 }}/><span style={{ fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif" }}>{curso.duracionHoras} horas</span></div>}
                      {(curso.fechaInicio||curso.fechaFin)&&<div style={{ display:'flex',alignItems:'center',gap:'7px' }}><Calendar style={{ width:'13px',height:'13px',color:'var(--gray-400)',flexShrink:0 }}/><span style={{ fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif" }}>{fmtDate(curso.fechaInicio)}{curso.fechaFin?` → ${fmtDate(curso.fechaFin)}`:''}</span></div>}
                      {curso.cupoMaximo   &&<div style={{ display:'flex',alignItems:'center',gap:'7px' }}><Users    style={{ width:'13px',height:'13px',color:'var(--gray-400)',flexShrink:0 }}/><span style={{ fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif" }}><span style={{ fontWeight:700,color:'var(--gray-800)' }}>{curso.inscritosCount||0}</span>/{curso.cupoMaximo} inscritos</span></div>}
                    </div>
                    <div style={{ display:'flex',gap:'6px',paddingTop:'14px',borderTop:'1px solid var(--gray-100)',justifyContent:'space-between',alignItems:'center' }}>
                      <button onClick={()=>cargarInscritos(curso)} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-600)',fontSize:'12px',fontFamily:"'DM Sans',sans-serif",fontWeight:600,transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='var(--capyme-blue-pale)';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-600)';}}>
                        <Users style={{ width:'13px',height:'13px' }}/>Inscritos ({curso.inscritosCount||0})
                      </button>
                      <div style={{ display:'flex',gap:'4px' }}>
                        {currentUser.rol!=='cliente'&&<button onClick={()=>handleOpenModal('edit',curso)} title="Editar" style={{ width:'34px',height:'34px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',transition:'all 150ms',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>{e.currentTarget.style.background='#EEF4FF';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}}>
                          <Edit style={{ width:'15px',height:'15px' }}/>
                        </button>}
                        {currentUser.rol==='admin'&&<button onClick={()=>handleToggle(curso)} title={curso.activo?'Desactivar':'Activar'} style={{ width:'34px',height:'34px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',transition:'all 150ms',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>{e.currentTarget.style.background=curso.activo?'#FEF2F2':'#ECFDF5';e.currentTarget.style.color=curso.activo?'#DC2626':'#065F46';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}}>
                          {curso.activo?<Trash2 style={{ width:'15px',height:'15px' }}/>:<CheckCircle style={{ width:'15px',height:'15px' }}/>}
                        </button>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ):(
          <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden',boxShadow:'var(--shadow-sm)' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'var(--gray-50)',borderBottom:'1px solid var(--border)' }}>{['Curso','Modalidad','Duración','Costo','Inscritos','Estado',''].map(h=><th key={h} style={{ padding:'11px 16px',textAlign:h===''?'right':'left',fontSize:'11px',fontWeight:700,color:'var(--gray-500)',fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>
                {filtrados.map(curso=>{
                  const ms=getMStyle(curso.modalidad),MI=getMIcon(curso.modalidad),esG=!curso.costo||parseFloat(curso.costo)===0;
                  return(
                    <tr key={curso.id} onMouseEnter={()=>setHoveredRow(curso.id)} onMouseLeave={()=>setHoveredRow(null)} style={{ borderBottom:'1px solid var(--gray-100)',background:hoveredRow===curso.id?'var(--gray-50)':'#fff',transition:'background 120ms',opacity:curso.activo?1:0.6 }}>
                      <td style={{ padding:'13px 16px',maxWidth:'240px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                          <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><GraduationCap style={{ width:'16px',height:'16px',color:'#fff' }}/></div>
                          <div style={{ fontSize:'14px',fontWeight:600,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif" }}>{curso.titulo}</div>
                        </div>
                      </td>
                      <td style={{ padding:'13px 16px' }}><span style={{ display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:ms.bg,color:ms.color,fontFamily:"'Plus Jakarta Sans',sans-serif" }}><MI style={{ width:'10px',height:'10px' }}/>{getMLabel(curso.modalidad)}</span></td>
                      <td style={{ padding:'13px 16px',fontSize:'13px',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif" }}>{curso.duracionHoras?`${curso.duracionHoras} h`:<span style={{color:'var(--gray-300)'}}>—</span>}</td>
                      <td style={{ padding:'13px 16px',fontSize:'13px',fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{esG?<span style={{color:'#065F46'}}>Gratis</span>:<span style={{color:'var(--gray-800)'}}>{fmt(curso.costo)}</span>}</td>
                      <td style={{ padding:'13px 16px' }}><button onClick={()=>cargarInscritos(curso)} style={{ display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-600)',fontSize:'12px',fontWeight:600,transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='var(--capyme-blue-pale)';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-600)';}}>
                        <Users style={{ width:'12px',height:'12px' }}/>{curso.inscritosCount||0}{curso.cupoMaximo?`/${curso.cupoMaximo}`:''}
                      </button></td>
                      <td style={{ padding:'13px 16px' }}><span style={{ display:'inline-block',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:curso.activo?'#ECFDF5':'#FEF2F2',color:curso.activo?'#065F46':'#DC2626',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{curso.activo?'Activo':'Inactivo'}</span></td>
                      <td style={{ padding:'13px 16px',textAlign:'right' }}>
                        <div style={{ display:'flex',gap:'4px',justifyContent:'flex-end' }}>
                          {currentUser.rol!=='cliente'&&<button onClick={()=>handleOpenModal('edit',curso)} style={{ width:'34px',height:'34px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',transition:'all 150ms',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>{e.currentTarget.style.background='#EEF4FF';e.currentTarget.style.color='var(--capyme-blue-mid)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}}>
                            <Edit style={{ width:'15px',height:'15px' }}/>
                          </button>}
                          {currentUser.rol==='admin'&&<button onClick={()=>handleToggle(curso)} style={{ width:'34px',height:'34px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',transition:'all 150ms',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>{e.currentTarget.style.background=curso.activo?'#FEF2F2':'#ECFDF5';e.currentTarget.style.color=curso.activo?'#DC2626':'#065F46';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-400)';}}>
                            {curso.activo?<Trash2 style={{ width:'15px',height:'15px' }}/>:<CheckCircle style={{ width:'15px',height:'15px' }}/>}
                          </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.42)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }}>
          <div className="curso-modal" onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:'var(--radius-lg)',width:'100%',maxWidth:'720px',maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',background:'var(--gray-50)',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center' }}><GraduationCap style={{ width:'18px',height:'18px',color:'#fff' }}/></div>
                <h2 style={{ fontSize:'18px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0 }}>{modalMode==='create'?'Nuevo Curso':'Editar Curso'}</h2>
              </div>
              <button onClick={handleCloseModal} style={{ width:'32px',height:'32px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-200)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><X style={{ width:'18px',height:'18px' }}/></button>
            </div>
            <div style={{ overflowY:'auto',flex:1,padding:'24px' }}>
              {/* Información general */}
              <div style={{ display:'flex',alignItems:'center',gap:'8px',paddingBottom:'4px',borderBottom:'1px solid var(--gray-100)',marginBottom:'14px' }}><BookOpen style={{ width:'14px',height:'14px',color:'var(--gray-400)' }}/><span style={{ fontSize:'11px',fontWeight:700,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.06em' }}>Información general</span></div>
              <div style={{ display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px' }}>
                <div><label style={labelSt}>Título <span style={{ color:'#EF4444' }}>*</span></label><input name="titulo" type="text" value={formData.titulo} onChange={handleChange} placeholder="Ej. Finanzas para PyMEs" style={{ ...inputBase,...(formErrors.titulo?inputErr:{}) }}/>{formErrors.titulo&&<p style={{ marginTop:'4px',fontSize:'12px',color:'#EF4444',display:'flex',alignItems:'center',gap:'4px' }}><AlertCircle style={{ width:'12px',height:'12px' }}/>{formErrors.titulo}</p>}</div>
                <div><label style={labelSt}>Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Describe el contenido…" style={textareaSt}/></div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
                  <div><label style={labelSt}>Instructor</label><div style={{ position:'relative' }}><User style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/><input name="instructor" type="text" value={formData.instructor} onChange={handleChange} placeholder="Nombre del instructor" style={inputIcon}/></div></div>
                  <div><label style={labelSt}>Duración (horas)</label><div style={{ position:'relative' }}><Clock style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/><input name="duracionHoras" type="number" min="1" value={formData.duracionHoras} onChange={handleChange} placeholder="0" style={{ ...inputIcon,...(formErrors.duracionHoras?inputErr:{}) }}/></div>{formErrors.duracionHoras&&<p style={{ marginTop:'4px',fontSize:'12px',color:'#EF4444' }}>{formErrors.duracionHoras}</p>}</div>
                </div>
              </div>
              {/* Configuración */}
              <div style={{ display:'flex',alignItems:'center',gap:'8px',paddingBottom:'4px',borderBottom:'1px solid var(--gray-100)',marginBottom:'14px' }}><Monitor style={{ width:'14px',height:'14px',color:'var(--gray-400)' }}/><span style={{ fontSize:'11px',fontWeight:700,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.06em' }}>Configuración</span></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px',marginBottom:'24px' }}>
                <div><label style={labelSt}>Modalidad</label><div style={{ position:'relative' }}><select name="modalidad" value={formData.modalidad} onChange={handleChange} style={selectSt}><option value="online">Online</option><option value="presencial">Presencial</option><option value="hibrido">Híbrido</option></select><ChevronDown style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/></div></div>
                <div><label style={labelSt}>Cupo Máximo</label><div style={{ position:'relative' }}><Users style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/><input name="cupoMaximo" type="number" min="1" value={formData.cupoMaximo} onChange={handleChange} placeholder="Sin límite" style={inputIcon}/></div></div>
                <div>
                  <label style={labelSt}>Costo (MXN)</label>
                  <div style={{ position:'relative' }}><DollarSign style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--gray-400)',pointerEvents:'none' }}/><input name="costo" type="number" step="0.01" min="0" value={formData.costo} onChange={handleChange} placeholder="0.00" style={{ ...inputIcon,...(formErrors.costo?inputErr:{}) }}/></div>
                  {formErrors.costo&&<p style={{ marginTop:'4px',fontSize:'12px',color:'#EF4444' }}>{formErrors.costo}</p>}
                  <p style={{ fontSize:'11px',color:'var(--gray-400)',margin:'4px 0 0',fontFamily:"'DM Sans',sans-serif" }}>0 = gratuito · Cobro automático vía Mercado Pago</p>
                </div>
              </div>
              {/* Vigencia */}
              <div style={{ display:'flex',alignItems:'center',gap:'8px',paddingBottom:'4px',borderBottom:'1px solid var(--gray-100)',marginBottom:'14px' }}><Calendar style={{ width:'14px',height:'14px',color:'var(--gray-400)' }}/><span style={{ fontSize:'11px',fontWeight:700,color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.06em' }}>Vigencia</span></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
                <div><label style={labelSt}>Fecha de Inicio</label><input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} style={inputBase}/></div>
                <div><label style={labelSt}>Fecha de Fin</label><input name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} style={{ ...inputBase,...(formErrors.fechaFin?inputErr:{}) }}/>{formErrors.fechaFin&&<p style={{ marginTop:'4px',fontSize:'12px',color:'#EF4444' }}>{formErrors.fechaFin}</p>}</div>
              </div>
            </div>
            <div style={{ display:'flex',justifyContent:'flex-end',gap:'10px',padding:'16px 24px',background:'var(--gray-50)',borderTop:'1px solid var(--border)',flexShrink:0 }}>
              <button onClick={handleCloseModal} disabled={submitting} style={{ padding:'9px 18px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',background:'#fff',color:'var(--gray-700)',fontSize:'14px',fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Cancelar</button>
              <button onClick={handleSubmit} disabled={submitting||!isFormValid} style={{ padding:'9px 22px',border:'none',borderRadius:'var(--radius-md)',background:(submitting||!isFormValid)?'var(--gray-300)':'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',color:'#fff',fontSize:'14px',fontWeight:600,cursor:(submitting||!isFormValid)?'not-allowed':'pointer',opacity:(submitting||!isFormValid)?0.6:1,boxShadow:(submitting||!isFormValid)?'none':'0 2px 8px rgba(31,78,158,0.28)',transition:'all 150ms',display:'flex',alignItems:'center',gap:'8px' }}>
                {submitting&&<span style={{ width:'14px',height:'14px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite' }}/>}
                {modalMode==='create'?'Crear Curso':'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inscritos */}
      {showInscritosModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.42)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }}>
          <div className="curso-modal" onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:'var(--radius-lg)',width:'100%',maxWidth:'700px',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',background:'var(--gray-50)',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center' }}><Users style={{ width:'18px',height:'18px',color:'#fff' }}/></div>
                <div>
                  <h2 style={{ fontSize:'16px',fontWeight:800,color:'var(--gray-900)',fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0 }}>Inscritos</h2>
                  <p style={{ fontSize:'12px',color:'var(--gray-400)',margin:'2px 0 0',fontFamily:"'DM Sans',sans-serif",maxWidth:'380px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{inscritosTitulo}</p>
                </div>
              </div>
              <button onClick={()=>setShowInscritosModal(false)} style={{ width:'32px',height:'32px',border:'none',borderRadius:'var(--radius-sm)',background:'transparent',cursor:'pointer',color:'var(--gray-400)',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-200)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><X style={{ width:'18px',height:'18px' }}/></button>
            </div>
            <div style={{ overflowY:'auto',flex:1 }}>
              {inscritos.length===0?(
                <div style={{ padding:'60px 20px',textAlign:'center' }}><Users style={{ width:'28px',height:'28px',color:'var(--gray-300)',margin:'0 auto 12px',display:'block' }}/><p style={{ fontSize:'14px',fontWeight:600,color:'var(--gray-600)',margin:0 }}>Sin inscritos</p></div>
              ):(
                <table style={{ width:'100%',borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'var(--gray-50)',borderBottom:'1px solid var(--border)' }}>{['Participante','Email','Pago MP','Estado','Fecha'].map(h=><th key={h} style={{ padding:'11px 16px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'var(--gray-500)',fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {inscritos.map(i=>{
                      const es=getEstStyle(i.estado),ini=`${i.usuario.nombre[0]}${i.usuario.apellido[0]}`.toUpperCase();
                      const ep=i.pago?.estadoPago;
                      const bgP=ep==='confirmado'?'#ECFDF5':ep==='pendiente'?'#FFFBEB':'#F3F4F6';
                      const colP=ep==='confirmado'?'#065F46':ep==='pendiente'?'#92400E':'#6B7280';
                      const lblP=ep==='confirmado'?'✓ Pagado':(ep==='pendiente'?'Pendiente':(ep||'Gratuito'));
                      return(
                        <tr key={i.id} style={{ borderBottom:'1px solid var(--gray-100)' }}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                              <div style={{ width:'32px',height:'32px',background:'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><span style={{ fontSize:'11px',fontWeight:700,color:'#fff' }}>{ini}</span></div>
                              <div style={{ fontSize:'13px',fontWeight:600,color:'var(--gray-900)',fontFamily:"'DM Sans',sans-serif" }}>{i.usuario.nombre} {i.usuario.apellido}</div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px',fontSize:'13px',color:'var(--gray-600)',fontFamily:"'DM Sans',sans-serif" }}>{i.usuario.email}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ display:'inline-block',padding:'3px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:bgP,color:colP,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                              {lblP}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px' }}><span style={{ display:'inline-block',padding:'3px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:es.bg,color:es.color,fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:'capitalize' }}>{i.estado?.replace('_',' ')}</span></td>
                          <td style={{ padding:'12px 16px',fontSize:'12px',color:'var(--gray-500)',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap' }}>{fmtDate(i.fechaInscripcion)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding:'14px 24px',background:'var(--gray-50)',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontSize:'13px',color:'var(--gray-500)' }}>{inscritos.length} inscrito{inscritos.length!==1?'s':''}</span>
              <button onClick={()=>setShowInscritosModal(false)} style={{ padding:'8px 18px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',background:'#fff',color:'var(--gray-700)',fontSize:'13px',fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </Layout>
  );
};

export default Cursos;