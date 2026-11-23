import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import SelectorModo from '../components/SelectorModo';
import { OfertasService, PostulacionesService } from '../services/api';
import './LandingPage.css';
import logo from '../team-work-logo-design-template-free-vector.jpg';

const beneficios = [
  {
    icon: 'bi-search-heart',
    titulo: 'Ofertas de Calidad',
    texto: 'Accede a más de 14.521 ofertas activas. Filtramos vacantes para que encuentres empleos legítimos y evites fraudes.',
    cita: 'Encontré el trabajo que buscaba en menos de una semana.',
  },
  {
    icon: 'bi-shield-check',
    titulo: 'Evaluaciones Reales',
    texto: 'Consulta evaluaciones de empresas y datos de salarios para decidir dónde quieres trabajar realmente.',
    cita: 'Las opiniones me ayudaron a conocer el ambiente laboral.',
  },
  {
    icon: 'bi-lightning-charge',
    titulo: 'Postulación Rápida',
    texto: 'Carga tu CV y postúlate al instante con un solo clic. Ahorra tiempo y gestiona tus aplicaciones.',
    cita: 'La postulación rápida simplifica todo el proceso.',
  },
];

const herramientas = [
  ['bi-filter-left', 'Busca', 'Filtra las oportunidades para encontrar la más adecuada.'],
  ['bi-clipboard-minus-fill', 'Crea', 'Puedes crear tus CV dinámicos con nuestras herramientas.'],
  ['bi-geo-alt-fill', 'Encuentra', 'Ve las oportunidades alrededor de ti con nuestro mapa.'],
  ['bi-person-fill-add', 'Agrega', 'Postula tus puestos desde tu perfil de empleador.'],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { rol, perfilId } = useSesion();
  const [bandejaAbierta, setBandejaAbierta] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);

  const claveVistas = rol && perfilId ? `mano_experta_notificaciones_vistas_${rol}_${perfilId}` : null;

  const obtenerVistas = () => {
    if (!claveVistas) return [];
    try {
      return JSON.parse(localStorage.getItem(claveVistas) || '[]');
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!rol || !perfilId) {
      setNotificaciones([]);
      return;
    }

    let activo = true;

    const cargarNotificaciones = async () => {
      setCargandoNotificaciones(true);
      try {
        if (rol === 'empleador') {
          const { data: ofertas } = await OfertasService.listar('', perfilId);
          const resultados = await Promise.all(
            ofertas.map(async oferta => {
              const { data: postulantes } = await OfertasService.postulantes(oferta.id);
              return postulantes.map(postulacion => ({
                id: `postulacion-${postulacion.id}`,
                titulo: postulacion.Perfil?.nombre_apellido || 'Nuevo postulante',
                texto: `Se postuló a ${oferta.puesto}`,
                fecha: postulacion.created_at,
                nueva: postulacion.estado === 'Pendiente',
                tipo: 'postulacion'
              }));
            })
          );

          if (activo) {
            const vistas = obtenerVistas();
            setNotificaciones(resultados.flat()
              .map(notificacion => ({
                ...notificacion,
                nueva: notificacion.nueva && !vistas.includes(notificacion.id)
              }))
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
          }
        } else {
          const { data: postulaciones } = await PostulacionesService.porPerfil(perfilId);
          if (activo) {
            const vistas = obtenerVistas();
            setNotificaciones(postulaciones
              .filter(postulacion => postulacion.estado !== 'Pendiente')
              .map(postulacion => ({
                id: `estado-${postulacion.id}`,
                titulo: postulacion.Oferta?.puesto || 'Tu postulación',
                texto: postulacion.estado === 'Aceptado'
                  ? 'El empleador te aceptó'
                  : postulacion.estado === 'Rechazado'
                    ? 'Tu postulación fue rechazada'
                    : 'El empleador vio tu postulación',
                fecha: postulacion.updated_at,
                nueva: postulacion.estado === 'Aceptado',
                tipo: postulacion.estado === 'Rechazado' ? 'rechazo' : 'estado'
              }))
              .map(notificacion => ({
                ...notificacion,
                nueva: notificacion.nueva && !vistas.includes(notificacion.id)
              }))
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
          }
        }
      } catch (error) {
        console.error(error);
        if (activo) setNotificaciones([]);
      } finally {
        if (activo) setCargandoNotificaciones(false);
      }
    };

    cargarNotificaciones();
    return () => {
      activo = false;
    };
  }, [rol, perfilId]);

  const contadorNuevas = notificaciones.filter(notificacion => notificacion.nueva).length;

  const abrirBandeja = () => {
    setBandejaAbierta(actual => {
      const vaAabrirse = !actual;
      if (vaAabrirse && claveVistas) {
        const vistas = obtenerVistas();
        const ids = notificaciones.map(notificacion => notificacion.id);
        localStorage.setItem(claveVistas, JSON.stringify([...new Set([...vistas, ...ids])]));
        setNotificaciones(actuales => actuales.map(notificacion => ({ ...notificacion, nueva: false })));
      }
      return vaAabrirse;
    });
  };

  const abrirNotificacion = (notificacion) => {
    setBandejaAbierta(false);
    if (rol === 'empleador') {
      navigate('/empleador');
    } else {
      navigate('/cv');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg landing-navbar py-3">
        <div className="container landing-nav-content">
          <button className="navbar-brand landing-brand border-0 bg-transparent" onClick={() => navigate('/')}>
            <img
              src={logo}
              alt="Logo Mano Experta"
              width="58"
              height="58"
            />
            <span className="landing-brand-name">
              <span>Mano</span><strong>Experta</strong>
            </span>
          </button>
          <div className="landing-actions ms-auto d-flex align-items-center">
            {rol ? <>
              <SelectorModo fondoClaro mostrarInicio={false} mostrarSalir={false} />
              <div className="landing-inbox position-relative">
                <button
                  type="button"
                  className="landing-inbox-button"
                  aria-label="Abrir bandeja de entrada"
                  aria-expanded={bandejaAbierta}
                  onClick={abrirBandeja}
                >
                  <i className="bi bi-bell-fill" aria-hidden="true" />
                  {contadorNuevas > 0 && (
                    <span className="landing-inbox-count">{contadorNuevas}</span>
                  )}
                </button>
                {bandejaAbierta && (
                  <div className="landing-inbox-panel">
                    <div className="landing-inbox-header">
                      <div>
                        <span>Bandeja de entrada</span>
                        <small>{notificaciones.length} {notificaciones.length === 1 ? 'notificación' : 'notificaciones'}</small>
                      </div>
                      {contadorNuevas > 0 && (
                        <span className="landing-inbox-total">{contadorNuevas} nueva{contadorNuevas === 1 ? '' : 's'}</span>
                      )}
                    </div>
                    <div className="landing-inbox-list">
                      {cargandoNotificaciones ? (
                        <div className="landing-inbox-empty">Cargando notificaciones...</div>
                      ) : notificaciones.length === 0 ? (
                        <div className="landing-inbox-empty">
                          <i className="bi bi-bell-slash" aria-hidden="true" />
                          <p>No tenés notificaciones.</p>
                        </div>
                      ) : notificaciones.map(notificacion => (
                        <button
                          type="button"
                          className={`landing-inbox-item ${notificacion.nueva ? 'is-new' : ''}`}
                          key={notificacion.id}
                          onClick={() => abrirNotificacion(notificacion)}
                        >
                          <span className={`landing-inbox-icon ${notificacion.tipo}`}>
                            <i className={`bi ${notificacion.tipo === 'rechazo' ? 'bi-x-lg' : notificacion.tipo === 'postulacion' ? 'bi-person-plus-fill' : 'bi-briefcase-fill'}`} aria-hidden="true" />
                          </span>
                          <span className="landing-inbox-copy">
                            <strong>{notificacion.titulo}</strong>
                            <span>{notificacion.texto}</span>
                          </span>
                          {notificacion.nueva && <span className="landing-inbox-dot" aria-label="Nueva" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </> : <>
            <button
              className="btn landing-login rounded-pill px-4 me-2"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            <button
              className="btn landing-register rounded-pill px-4"
              onClick={() => navigate('/registro')}
            >
              Registrarme
            </button>
            </>}
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-kicker">
              <i className="bi bi-geo-alt-fill" aria-hidden="true" />
              Oportunidades cerca de vos
            </span>
            <h1>¡Ahora es el momento de cambiar!</h1>
            <p className="hero-description">
              Encuentra el empleo que encaja contigo, más de{' '}
              <strong>14.521</strong> ofertas
            </p>
            <button
              className="btn hero-button"
              onClick={() => navigate(rol === 'empleador' ? '/empleador' : rol === 'empleado' ? '/cv' : '/login')}
            >
              Comenzar
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section benefits-section">
        <div className="container landing-container">
          <p className="benefits-summary">
            Hoy hay <strong>3.898</strong> empresas contratando con las mejores
            vacantes para ti
          </p>

          <div className="row g-4">
            {beneficios.map((beneficio, index) => (
              <div className="col-md-4" key={beneficio.titulo}>
                <article className={`landing-card benefit-card benefit-card-${index + 1}`}>
                  <div className="benefit-icon">
                    <i className={`bi ${beneficio.icon}`} aria-hidden="true" />
                  </div>
                  <h2>{beneficio.titulo}</h2>
                  <p className="benefit-text">{beneficio.texto}</p>
                  <p className="benefit-cita">
                    “{beneficio.cita}”
                  </p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section tools-section">
        <div className="container landing-container">
          <div className="tools-heading">
            <span>Todo en un solo lugar</span>
            <h2>Conoce todas las herramientas que ofrecemos</h2>
          </div>

          <div className="row g-4">
            {herramientas.map(([icono, titulo, texto]) => (
              <div className="col-md-6 col-lg-3" key={titulo}>
                <article className="landing-card tool-card">
                  <span className="tool-icon">
                    <i className={`bi ${icono}`} aria-hidden="true" />
                  </span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer text-white text-center p-2">
        <p className="mb-0">© Todos los derechos reservados. Mano Experta</p>
      </footer>
    </>
  );
}