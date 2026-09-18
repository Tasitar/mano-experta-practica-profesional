import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext';

export default function LoginPage() {
    const { guardarRol } = useSesion();
    const navigate = useNavigate();

    const ingresar = (rol) => {
        guardarRol(rol);
        navigate(rol === 'empleado' ? '/cv' : '/mapa');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: '#f4f4f4' }}>
            <div className="container">
                <h1 className="text-center mb-2">Tablón de Empleo</h1>
                <p className="text-center text-muted mb-5">Elegí cómo querés ingresar</p>

                <div className="row g-4 justify-content-center">

                    <div className="col-md-5">
                        <div
                            className="card h-100"
                            onClick={() => ingresar('empleado')}
                            style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body text-center py-5">
                                <div className="fs-1 mb-3">🧑‍💼</div>
                                <h4>Soy empleado</h4>
                                <p className="text-muted mb-0">
                                    Cargá tu perfil y postulate a ofertas laborales en el mapa
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-5">
                        <div
                            className="card h-100"
                            onClick={() => ingresar('empleador')}
                            style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body text-center py-5">
                                <div className="fs-1 mb-3">🏢</div>
                                <h4>Soy empleador</h4>
                                <p className="text-muted mb-0">
                                    Publicá ofertas y mirá quién se postuló
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}