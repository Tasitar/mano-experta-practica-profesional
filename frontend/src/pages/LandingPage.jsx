import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import SelectorModo from '../components/SelectorModo';
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
  const { rol } = useSesion();

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
              onClick={() => navigate('/login')}
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