import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import { PerfilesService } from '../services/api';

const FORM_INICIAL = {
    nombre_apellido: '',
    email: '',
    password: '',
    domicilio: '',
    edad: '',
    sexo: '',
    fecha_nacimiento: ''
};

export default function RegistroPage() {
    const navigate = useNavigate();
    const { guardarRol, guardarPerfilId } = useSesion();
    const [form, setForm] = useState(FORM_INICIAL);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const cambiar = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const registrarse = async (event) => {
        event.preventDefault();
        setError('');
        setCargando(true);
        try {
            const { data } = await PerfilesService.registrar({ ...form, edad: Number(form.edad) });
            guardarRol(data.rol);
            guardarPerfilId(data.id);
            navigate('/');
        } catch (err) {
            const errores = err.response?.data?.errors;
            setError(errores ? errores.map(({ msg }) => msg).join(', ') : (err.response?.data?.error || 'No se pudo completar el registro'));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ background: '#f4f4f4' }}>
            <main className="container">
                <div className="card shadow-sm mx-auto" style={{ maxWidth: 720 }}>
                    <div className="card-body p-4 p-md-5">
                        <h1 className="h3 mb-2">Crear cuenta</h1>
                        <p className="text-muted mb-4">Creá una cuenta para buscar trabajo y publicar tus propias ofertas.</p>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={registrarse}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre y apellido</label>
                                    <input className="form-control" name="nombre_apellido" value={form.nombre_apellido} onChange={cambiar} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Correo electrónico</label>
                                    <input className="form-control" type="email" name="email" value={form.email} onChange={cambiar} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Contraseña</label>
                                    <input className="form-control" type="password" name="password" minLength="8" value={form.password} onChange={cambiar} required />
                                    <small className="text-muted">Mínimo 8 caracteres.</small>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Domicilio</label>
                                    <input className="form-control" name="domicilio" value={form.domicilio} onChange={cambiar} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Edad</label>
                                    <input className="form-control" type="number" name="edad" min="13" max="120" value={form.edad} onChange={cambiar} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Sexo</label>
                                    <select className="form-select" name="sexo" value={form.sexo} onChange={cambiar} required>
                                        <option value="">Seleccionar</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="no_especificar">Prefiero no especificar</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Fecha de nacimiento</label>
                                    <input className="form-control" type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={cambiar} required />
                                </div>
                            </div>
                            <button className="btn btn-primary w-100 mt-4" disabled={cargando}>
                                {cargando ? 'Creando cuenta...' : 'Registrarme'}
                            </button>
                            <button type="button" className="btn btn-link w-100 mt-2" onClick={() => navigate('/login')}>
                                Ya tengo una cuenta
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
