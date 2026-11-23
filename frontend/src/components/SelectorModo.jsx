import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';

export default function SelectorModo({
    fondoClaro = false,
    mostrarInicio = true,
    mostrarSalir = true
}) {
    const { rol, guardarRol, cerrar } = useSesion();
    const navigate = useNavigate();

    const cambiarModo = (modo) => {
        guardarRol(modo);
        navigate(modo === 'empleador' ? '/empleador' : '/cv');
    };

    const irAlInicio = () => {
        navigate('/');
    };

    const salir = () => {
        cerrar();
        navigate('/');
    };

    return (
        <div className={`profile-mode-switcher ${fondoClaro ? 'profile-mode-switcher-clear' : ''}`}>
            <div className="profile-mode-options" role="group" aria-label="Elegir modo de uso">
                <button
                    type="button"
                    className={`profile-mode-option ${rol === 'empleado' ? 'active' : ''}`}
                    aria-pressed={rol === 'empleado'}
                    onClick={() => cambiarModo('empleado')}
                >
                    Buscar oportunidades
                </button>
                <button
                    type="button"
                    className={`profile-mode-option ${rol === 'empleador' ? 'active' : ''}`}
                    aria-pressed={rol === 'empleador'}
                    onClick={() => cambiarModo('empleador')}
                >
                    Busco contratar
                </button>
            </div>
            {mostrarInicio && (
                <button
                    type="button"
                    className="profile-mode-logout"
                    onClick={irAlInicio}
                >
                    <i className="bi bi-house-door me-1" aria-hidden="true" />
                    Inicio
                </button>
            )}
            {mostrarSalir && (
                <button
                    type="button"
                    className="profile-mode-logout"
                    onClick={salir}
                >
                    Salir
                </button>
            )}
        </div>
    );
}