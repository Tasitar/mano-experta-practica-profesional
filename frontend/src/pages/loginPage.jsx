import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import { PerfilesService } from '../services/api';
import { useState } from 'react';

export default function LoginPage() {
    const { guardarRol, guardarPerfilId } = useSesion();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const ingresar = async (event) => {
        event.preventDefault();
        setError('');
        setCargando(true);
        try {
            const { data } = await PerfilesService.login(form);
            guardarRol(data.rol);
            guardarPerfilId(data.id);
            navigate('/');
        } catch (err) {
            const errores = err.response?.data?.errors;
            setError(errores ? errores.map(({ msg }) => msg).join(', ') : (err.response?.data?.error || 'No se pudo iniciar sesión'));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: '#f5efe6' }}>
            <div className="container">
                <h1 className="text-center mb-2">Tablón de Empleo</h1>
                <p className="text-center text-muted mb-4">Ingresá con tu correo y contraseña</p>
                <form className="card shadow-sm mx-auto p-4" style={{ maxWidth: 480 }} onSubmit={ingresar}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <label className="form-label">Correo electrónico</label>
                    <input className="form-control mb-3" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <label className="form-label">Contraseña</label>
                    <input className="form-control mb-4" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button className="btn btn-primary w-100" disabled={cargando}>{cargando ? 'Ingresando...' : 'Iniciar sesión'}</button>
                    <button type="button" className="btn btn-link mt-2" onClick={() => navigate('/registro')}>Crear una cuenta</button>
                </form>
            </div>
        </div>
    );
}