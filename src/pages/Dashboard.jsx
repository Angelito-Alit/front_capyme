import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { dashboardService } from '../services/dashboardService';
import {
  Building2, Users, FileText, ClipboardList,
  GraduationCap, CheckCircle, RefreshCw, TrendingUp,
  Calendar, BarChart2, PieChart, Activity,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PALETA = [
  'var(--capyme-blue-mid)',
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0891B2',
  '#BE185D',
  '#65A30D',
];

const estadoBadge = {
  pendiente:   { bg: '#FFFBEB', color: '#B45309', label: 'Pendiente' },
  en_revision: { bg: '#EFF6FF', color: '#1D4ED8', label: 'En Revisión' },
  aprobada:    { bg: '#ECFDF5', color: '#065F46', label: 'Aprobada' },
  rechazada:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rechazada' },
  completada:  { bg: '#F5F3FF', color: '#6D28D9', label: 'Completada' },
  enviado:     { bg: '#EFF6FF', color: '#1D4ED8', label: 'Enviado' },
  en_revision_fin: { bg: '#FFFBEB', color: '#B45309', label: 'En Revisión' },
  aprobado:    { bg: '#ECFDF5', color: '#065F46', label: 'Aprobado' },
  rechazado:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rechazado' },
};

const StatCard = ({ titulo, valor, icono: Icon, colorBg, colorIcon, colorBar }) => (
  <div
    style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)', transition: 'all 200ms ease',
      position: 'relative', overflow: 'hidden', cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
      background: colorBar, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--gray-500)', marginBottom: '8px' }}>{titulo}</p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1, letterSpacing: '-0.02em' }}>{valor}</p>
      </div>
      <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', background: colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '22px', height: '22px', color: colorIcon }} />
      </div>
    </div>
  </div>
);

const CardShell = ({ icon: Icon, iconBg, iconColor, titulo, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', background: iconBg, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '16px', height: '16px', color: iconColor }} />
      </div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>{titulo}</h2>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
);

const BarrasHorizontales = ({ data, labelKey, valueKey, color }) => {
  if (!data?.length) return <EmptyState />;
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item, i) => {
        const pct = max > 0 ? (item[valueKey] / max) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>{item[labelKey]}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: color || 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item[valueKey]}</span>
            </div>
            <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color || 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: '99px', transition: 'width 700ms ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({ data, labelKey, valueKey }) => {
  if (!data?.length) return <EmptyState />;
  const total = data.reduce((s, d) => s + d[valueKey], 0);
  if (total === 0) return <EmptyState />;
  const R = 52, CX = 68, CY = 68, stroke = 22;
  const circunferencia = 2 * Math.PI * R;

  let acumulado = 0;
  const segmentos = data.map((item, i) => {
    const pct = item[valueKey] / total;
    const dash = pct * circunferencia;
    const gap = circunferencia - dash;
    const offset = circunferencia - acumulado * circunferencia;
    acumulado += pct;
    return { ...item, dash, gap, offset, color: PALETA[i % PALETA.length] };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <svg width="136" height="136" viewBox="0 0 136 136" style={{ flexShrink: 0 }}>
        {segmentos.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: 'all 600ms ease' }}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", fill: 'var(--gray-900)' }}>{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" style={{ fontSize: '10px', fontFamily: "'DM Sans', sans-serif", fill: 'var(--gray-400)' }}>total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {segmentos.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{s[labelKey]}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {s[valueKey]} <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 400 }}>({Math.round((s[valueKey] / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarrasVerticales = ({ data, labelKey, valueKey, color2Key }) => {
  if (!data?.length) return <EmptyState />;
  const max = Math.max(...data.map(d => d[valueKey]));
  const H = 120;
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', minWidth: `${data.length * 52}px`, height: `${H + 32}px`, paddingBottom: '32px', position: 'relative' }}>
        {data.map((item, i) => {
          const barH = max > 0 ? Math.max((item[valueKey] / max) * H, 4) : 4;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-700)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item[valueKey]}</span>
              <div
                style={{ width: '100%', maxWidth: '40px', height: `${barH}px`, borderRadius: '6px 6px 0 0', background: color2Key ? `linear-gradient(180deg, ${PALETA[i % PALETA.length]}, ${PALETA[(i + 1) % PALETA.length]})` : 'linear-gradient(180deg, var(--capyme-blue-mid), var(--capyme-blue))', transition: 'height 700ms ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              />
              <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: '44px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item[labelKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LineaChart = ({ data }) => {
  if (!data?.length) return <EmptyState />;
  const W = 420, H = 110, PAD = { t: 10, b: 30, l: 30, r: 10 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map(d => d.total), 1);

  const xOf = (i) => PAD.l + (i / (data.length - 1 || 1)) * innerW;
  const yOf = (v) => PAD.t + innerH - (v / maxVal) * innerH;

  const makePolyline = (key) => data.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(' ');
  const makePath = (key, fill) => {
    const pts = data.map((d, i) => `${xOf(i)},${yOf(d[key])}`);
    return `M ${pts[0]} L ${pts.join(' L ')} L ${xOf(data.length - 1)},${PAD.t + innerH} L ${PAD.l},${PAD.t + innerH} Z`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: '280px' }}>
        {[0, 0.5, 1].map((t, i) => (
          <line key={i} x1={PAD.l} y1={PAD.t + innerH * (1 - t)} x2={W - PAD.r} y2={PAD.t + innerH * (1 - t)}
            stroke="var(--gray-100)" strokeWidth="1" />
        ))}

        <path d={makePath('total')} fill="rgba(31,78,158,0.07)" />
        <polyline points={makePolyline('total')} fill="none" stroke="var(--capyme-blue-mid)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        <path d={makePath('aprobadas')} fill="rgba(5,150,105,0.07)" />
        <polyline points={makePolyline('aprobadas')} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 3" />

        {data.map((d, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(d.total)} r="3.5" fill="var(--capyme-blue-mid)" />
        ))}

        {data.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" style={{ fontSize: '9px', fill: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
            {d.mes?.slice(5)}
          </text>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '3px', background: 'var(--capyme-blue-mid)', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '3px', background: '#059669', borderRadius: '2px', backgroundImage: 'repeating-linear-gradient(90deg,#059669 0,#059669 5px,transparent 5px,transparent 8px)' }} />
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Aprobadas</span>
        </div>
      </div>
    </div>
  );
};

const BarrasDobles = ({ data }) => {
  if (!data?.length) return <EmptyState />;
  const max = Math.max(...data.map(d => Math.max(d.inscritos, d.cupo)), 1);
  const H = 120;
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', minWidth: `${data.length * 72}px`, paddingBottom: '4px' }}>
        {data.map((item, i) => {
          const hI = max > 0 ? Math.max((item.inscritos / max) * H, 4) : 4;
          const hC = max > 0 ? Math.max((item.cupo / max) * H, 4) : 4;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.inscritos}</span>
                  <div style={{ width: '18px', height: `${hI}px`, background: 'linear-gradient(180deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: '4px 4px 0 0', transition: 'height 700ms ease' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-300)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.cupo}</span>
                  <div style={{ width: '18px', height: `${hC}px`, background: 'var(--gray-200)', borderRadius: '4px 4px 0 0', transition: 'height 700ms ease' }} />
                </div>
              </div>
              <span style={{ fontSize: '9px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.titulo}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--capyme-blue-mid)' }} />
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Inscritos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gray-200)' }} />
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cupo máx.</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: '8px' }}>
    <BarChart2 style={{ width: '28px', height: '28px', color: 'var(--gray-200)' }} />
    <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>Sin datos disponibles</p>
  </div>
);

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 700ms linear infinite' }} />
    <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>Cargando dashboard...</p>
  </div>
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [negociosPorCategoria, setNegociosPorCategoria] = useState([]);
  const [postulacionesPorEstado, setPostulacionesPorEstado] = useState([]);
  const [ultimosNegocios, setUltimosNegocios] = useState([]);
  const [ultimasPostulaciones, setUltimasPostulaciones] = useState([]);
  const [postulacionesPorMes, setPostulacionesPorMes] = useState([]);
  const [negociosPorEstado, setNegociosPorEstado] = useState([]);
  const [inscripcionesPorCurso, setInscripcionesPorCurso] = useState([]);
  const [usuariosPorRol, setUsuariosPorRol] = useState([]);
  const [financiamientoPorEstado, setFinanciamientoPorEstado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [
        stats, categorias, estados, negocios, postulaciones,
        porMes, negEstado, inscCursos, usrRol, finEstado,
      ] = await Promise.all([
        dashboardService.getEstadisticas(),
        dashboardService.getNegociosPorCategoria(),
        dashboardService.getPostulacionesPorEstado(),
        dashboardService.getUltimosNegocios(5),
        dashboardService.getUltimasPostulaciones(5),
        dashboardService.getPostulacionesPorMes(),
        dashboardService.getNegociosPorEstado(),
        dashboardService.getInscripcionesPorCurso(),
        dashboardService.getUsuariosPorRol(),
        dashboardService.getFinanciamientoPorEstado(),
      ]);

      setEstadisticas(stats.data);
      setNegociosPorCategoria(categorias.data);
      setPostulacionesPorEstado(estados.data);
      setUltimosNegocios(negocios.data);
      setUltimasPostulaciones(postulaciones.data);
      setPostulacionesPorMes(porMes.data);
      setNegociosPorEstado(negEstado.data);
      setInscripcionesPorCurso(inscCursos.data);
      setUsuariosPorRol(usrRol.data);
      setFinanciamientoPorEstado(finEstado.data);
    } catch {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    { titulo: 'Negocios Activos',    valor: estadisticas?.totalNegocios ?? 0,           icono: Building2,     colorBg: '#EEF4FF', colorIcon: 'var(--capyme-blue-mid)', colorBar: 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' },
    { titulo: 'Clientes',            valor: estadisticas?.totalClientes ?? 0,            icono: Users,         colorBg: '#ECFDF5', colorIcon: '#059669',                 colorBar: 'linear-gradient(90deg, #059669, #34D399)' },
    { titulo: 'Programas Activos',   valor: estadisticas?.totalProgramas ?? 0,           icono: FileText,      colorBg: '#F5F3FF', colorIcon: '#7C3AED',                 colorBar: 'linear-gradient(90deg, #7C3AED, #A78BFA)' },
    { titulo: 'Post. Pendientes',    valor: estadisticas?.postulacionesPendientes ?? 0,  icono: ClipboardList, colorBg: '#FFF7ED', colorIcon: '#D97706',                 colorBar: 'linear-gradient(90deg, #D97706, #FCD34D)' },
    { titulo: 'Post. Aprobadas',     valor: estadisticas?.postulacionesAprobadas ?? 0,   icono: CheckCircle,   colorBg: '#F0FDF4', colorIcon: '#16A34A',                 colorBar: 'linear-gradient(90deg, #16A34A, #4ADE80)' },
    { titulo: 'Cursos Disponibles',  valor: estadisticas?.cursosDisponibles ?? 0,        icono: GraduationCap, colorBg: '#EFF6FF', colorIcon: '#2563EB',                 colorBar: 'linear-gradient(90deg, #2563EB, #60A5FA)' },
  ];

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Dashboard Administrativo</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}></p>
          </div>
          <button
            onClick={() => cargarDatos(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.7 : 1, boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 200ms ease', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { if (!refreshing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <RefreshCw style={{ width: '15px', height: '15px', animation: refreshing ? 'spin 700ms linear infinite' : 'none' }} />
            {refreshing ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CardShell icon={Activity} iconBg='#EEF4FF' iconColor='var(--capyme-blue-mid)' titulo='Postulaciones por Mes'>
            <LineaChart data={postulacionesPorMes} />
          </CardShell>

          <CardShell icon={PieChart} iconBg='#F5F3FF' iconColor='#7C3AED' titulo='Postulaciones por Estado'>
            <DonutChart data={postulacionesPorEstado} labelKey='estado' valueKey='total' />
          </CardShell>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CardShell icon={TrendingUp} iconBg='#EEF4FF' iconColor='var(--capyme-blue-mid)' titulo='Negocios por Categoría'>
            <BarrasHorizontales data={negociosPorCategoria} labelKey='categoria' valueKey='total' />
          </CardShell>

          <CardShell icon={Users} iconBg='#ECFDF5' iconColor='#059669' titulo='Usuarios por Rol'>
            <DonutChart data={usuariosPorRol} labelKey='rol' valueKey='total' />
          </CardShell>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CardShell icon={GraduationCap} iconBg='#EFF6FF' iconColor='#2563EB' titulo='Cursos: Inscritos vs Cupo'>
            <BarrasDobles data={inscripcionesPorCurso} />
          </CardShell>

          <CardShell icon={Building2} iconBg='var(--capyme-blue-pale)' iconColor='var(--capyme-blue-mid)' titulo='Estado de Negocios'>
            <DonutChart data={negociosPorEstado} labelKey='estado' valueKey='total' />
          </CardShell>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CardShell icon={FileText} iconBg='#ECFDF5' iconColor='#059669' titulo='Financiamiento por Estado'>
            <BarrasVerticales data={financiamientoPorEstado} labelKey='estado' valueKey='total' color2Key />
          </CardShell>

          <CardShell icon={Calendar} iconBg='#EEF4FF' iconColor='var(--capyme-blue-mid)' titulo='Últimos Negocios Registrados'>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ultimosNegocios.length > 0 ? ultimosNegocios.map(negocio => (
                <div key={negocio.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)', transition: 'background 150ms ease', borderRadius: 'var(--radius-sm)', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {negocio.nombreNegocio?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{negocio.nombreNegocio}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px', fontFamily: "'DM Sans', sans-serif" }}>{negocio.categoria?.nombre} · {new Date(negocio.fechaRegistro).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
              )) : <EmptyState />}
            </div>
          </CardShell>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CardShell icon={Calendar} iconBg='#F5F3FF' iconColor='#7C3AED' titulo='Últimas Postulaciones'>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ultimasPostulaciones.length > 0 ? ultimasPostulaciones.map(p => {
                const badge = estadoBadge[p.estado] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', label: p.estado };
                return (
                  <div key={p.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)', transition: 'background 150ms ease', borderRadius: 'var(--radius-sm)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{p.programa?.nombre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px', fontFamily: "'DM Sans', sans-serif" }}>{p.negocio?.nombreNegocio}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ padding: '2px 8px', background: badge.bg, color: badge.color, borderRadius: '99px', fontSize: '10px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{badge.label}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gray-300)', fontFamily: "'DM Sans', sans-serif" }}>{new Date(p.fechaPostulacion).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                );
              }) : <EmptyState />}
            </div>
          </CardShell>

          <div />
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;