import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext';
import { PerfilesService, PostulacionesService } from '../services/api';

const ESTADO_COLORES = {
    Pendiente:  '#6c757d',
    Visto:      '#0d6efd',
    Contactado: '#198754',
    Rechazado:  '#dc3545'
};

export default function CVPage() {
    const { perfilId, guardarPerfilId, cerrar } = useSesion();
    const navigate = useNavigate();

    const [perfil,        setPerfil]        = useState(null);
    const [postulaciones, setPostulaciones] = useState([]);
    const [cargando,      setCargando]      = useState(true);
    const [toast,         setToast]         = useState('');
    const [form, setForm] = useState({
        nombre_apellido: '', fecha_nacimiento: '',
        domicilio: '', aptitudes: '', experiencias: ''
    });

    useEffect(() => {
        if (perfilId) {
            PerfilesService.obtener(perfilId)
                .then(r => {
                    setPerfil(r.data);
                    return PostulacionesService.porPerfil(perfilId);
                })
                .then(r => setPostulaciones(r.data))
                .catch(() => guardarPerfilId(''))
                .finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await PerfilesService.crear(form);
            guardarPerfilId(data.id);
            setPerfil(data);
            mostrarToast('✅ Perfil guardado correctamente.');
        } catch (err) {
            const errores = err.response?.data?.errors;
            const msg = errores ? errores.map(e => e.msg).join(', ') : err.message;
            alert('Error: ' + msg);
        }
    };

    const mostrarToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const salir = () => { cerrar(); navigate('/'); };

    if (cargando) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>

            <nav className="navbar navbar-dark mb-4" style={{ background: '#198754' }}>
                <div className="container">
                    <span className="navbar-brand mb-0 h1">Tablón de Empleo · Empleado</span>
                    <div>
                        <button className="btn btn-light btn-sm me-2" onClick={() => navigate('/mapa')}>
                            Ver mapa de ofertas
                        </button>
                        <button className="btn btn-outline-light btn-sm" onClick={salir}>Salir</button>
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row g-4">

                    {/* FORMULARIO o PERFIL */}
                    <div className="col-lg-7">
                        {!perfil ? (
                            <div className="card">
                                <div className="card-header bg-success text-white">Mi perfil / CV</div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        {[
                                            { label: 'Nombre y apellido', key: 'nombre_apellido', type: 'text' },
                                            { label: 'Fecha de nacimiento', key: 'fecha_nacimiento', type: 'date' },
                                            { label: 'Dónde te alojás', key: 'domicilio', type: 'text', placeholder: 'Barrio, ciudad' }
                                        ].map(({ label, key, type, placeholder }) => (
                                            <div className="mb-3" key={key}>
                                                <label className="form-label">{label}</label>
                                                <input type={type} className="form-control"
                                                    placeholder={placeholder}
                                                    value={form[key]}
                                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                    required />
                                            </div>
                                        ))}

                                        {[
                                            { label: 'Aptitudes', key: 'aptitudes', placeholder: 'Ej: manejo de Excel, atención al público...' },
                                            { label: 'Experiencias', key: 'experiencias', placeholder: 'Contá tus trabajos anteriores', rows: 4 }
                                        ].map(({ label, key, placeholder, rows = 3 }) => (
                                            <div className="mb-3" key={key}>
                                                <label className="form-label">{label}</label>
                                                <textarea className="form-control" rows={rows}
                                                    placeholder={placeholder}
                                                    value={form[key]}
                                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                    required />
                                            </div>
                                        ))}

                                        <button type="submit" className="btn btn-success w-100">
                                            Guardar perfil
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header bg-success text-white">Mi perfil / CV</div>
                                <div className="card-body">
                                    <h4>{perfil.nombre_apellido}</h4>
                                    <p className="text-muted mb-3">
                                        Nacimiento: {new Date(perfil.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                                        · {perfil.domicilio}
                                    </p>
                                    <h6>Aptitudes</h6>
                                    <p>{perfil.aptitudes}</p>
                                    <h6>Experiencias</h6>
                                    <p>{perfil.experiencias}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* POSTULACIONES */}
                    <div className="col-lg-5">
                        <div className="card">
                            <div className="card-header bg-primary text-white">Mis postulaciones</div>
                            <div className="card-body">
                                {!perfil && <p className="text-muted">Cargá tu perfil primero.</p>}
                                {perfil && postulaciones.length === 0 && (
                                    <p className="text-muted">Todavía no te postulaste a ninguna oferta.</p>
                                )}
                                {postulaciones.map(p => (
                                    <div className="card mb-3" key={p.id}
                                        style={{ borderLeft: `4px solid ${ESTADO_COLORES[p.estado] ?? '#6c757d'}` }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">{p.Oferta.puesto}</h6>
                                                    <p className="text-muted mb-0 small">
                                                        {p.Oferta.empresa} · {p.Oferta.modalidad}
                                                    </p>
                                                </div>
                                                <span className="badge" style={{ background: ESTADO_COLORES[p.estado] }}>
                                                    {p.estado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: '#198754', color: '#fff', padding: '10px 20px',
                    borderRadius: 6, zIndex: 9999
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}