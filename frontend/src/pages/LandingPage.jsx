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
      <nav className="navbar navbar-expand-lg landing-navbar border-bottom py-3">
        <div className="container">
          <button className="navbar-brand border-0 bg-transparent" onClick={() => navigate('/')}>
            <img
              src={logo}
              alt="Logo Mano Experta"
              width="55"
              height="55"
            />
          </button>

          <span className="navbar-brand fw-bold fs-2">
            <span style={{ color: '#1a428a' }}>Mano</span>
            <span style={{ color: '#2600ff' }}>Experta</span>
          </span>

          <div className="ms-auto d-flex align-items-center">
            {rol ? <SelectorModo fondoClaro /> : <>
            <button
              className="btn btn-outline-primary rounded-pill px-4 me-2"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate('/registro')}
            >
              Registrarme
            </button>
            </>}
          </div>
        </div>
      </nav>

      <section className="hero-section text-center text-white">
        <div className="container p-5">
          <h1 className="fw-bold">¡Ahora es el momento de cambiar!</h1>
          <p className="fs-5">
            Encuentra el empleo que encaja contigo, más de{' '}
            <strong>14.521</strong> ofertas
          </p>

          <button
            className="btn btn-light btn-lg rounded-pill px-5"
            onClick={() => navigate('/login')}
          >
            Comenzar
          </button>
        </div>
      </section>

      <section className="py-5 landing-section">
        <div className="container">
          <p className="text-center text-muted mb-5 fs-4">
            Hoy hay <strong>3.898</strong> empresas contratando con las mejores
            vacantes para ti
          </p>

          <div className="row g-4 justify-content-center">
            {beneficios.map((beneficio) => (
              <div className="col-md-4" key={beneficio.titulo}>
                <article className="card shadow border-0 h-100 text-center p-4 landing-card">
                  <div className="card-body">
                    <i className={`bi ${beneficio.icon} text-primary display-3`} />
                    <h2 className="fw-bold mb-3">{beneficio.titulo}</h2>
                    <p className="fs-5 text-secondary">{beneficio.texto}</p>
                    <hr className="w-25 mx-auto" />
                    <p className="fst-italic text-muted mt-4">
                      “{beneficio.cita}”
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 landing-section">
        <div className="container">
          <h2 className="fw-bold text-primary text-center mb-5">
            Conoce todas las herramientas que ofrecemos
          </h2>

          <div className="row g-4 justify-content-center">
            {herramientas.map(([icono, titulo, texto]) => (
              <div className="col-md-5" key={titulo}>
                <article className="card landing-card h-100 shadow-sm border-0 p-4">
                  <div className="card-body">
                    <i className={`bi ${icono} text-primary fs-1`} />
                    <h3 className="fw-bold mt-3">{titulo}</h3>
                    <p className="text-muted fs-5">{texto}</p>
                  </div>
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