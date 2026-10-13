import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';

export default function SelectorModo({ fondoClaro = false }) {
    const { rol, guardarRol, cerrar } = useSesion();
    const navigate = useNavigate();

    const cambiarModo = (modo) => {
        guardarRol(modo);
        navigate(modo === 'empleador' ? '/empleador' : '/cv');
    };

    const salir = () => {
        cerrar();
        navigate('/');
    };

    return (
        <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm" role="group" aria-label="Elegir modo de uso">
                <button
                    type="button"
                    className={`btn ${rol === 'empleado' ? 'btn-primary' : fondoClaro ? 'btn-outline-primary' : 'btn-outline-light'}`}
                    aria-pressed={rol === 'empleado'}
                    onClick={() => cambiarModo('empleado')}
                >
                    Buscar oportunidades
                </button>
                <button
                    type="button"
                    className={`btn ${rol === 'empleador' ? 'btn-primary' : fondoClaro ? 'btn-outline-primary' : 'btn-outline-light'}`}
                    aria-pressed={rol === 'empleador'}
                    onClick={() => cambiarModo('empleador')}
                >
                    Busco contratar
                </button>
            </div>
            <button
                className={`btn ${fondoClaro ? 'btn-outline-primary' : 'btn-outline-light'} btn-sm`}
                onClick={salir}
            >
                Salir
            </button>
        </div>
    );
}