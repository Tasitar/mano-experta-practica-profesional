import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext';
import { OfertasService, PostulacionesService } from '../services/api';

const ESTADO_COLORES = {
    Pendiente:  '#6c757d',
    Visto:      '#0d6efd',
    Contactado: '#198754',
    Rechazado:  '#dc3545'
};

const BADGE_MODALIDAD = {
    Presencial: '#0d6efd',
    Remoto:     '#198754',
    'Híbrido':  '#fd7e14'
};

export default function EmpleadorPage() {
    const { cerrar } = useSesion();
    const navigate   = useNavigate();

    const [ofertas,           setOfertas]           = useState([]);
    const [filtroModalidad,   setFiltroModalidad]   = useState('');
    const [ofertaActiva,      setOfertaActiva]      = useState(null);
    const [postulantes,       setPostulantes]       = useState([]);
    const [cargandoPostulantes, setCargandoPostulantes] = useState(false);
    const [detallePostulacion,  setDetallePostulacion]  = useState(null);

    // ─── Cargar ofertas ──────────────────────────────────────────────────────
    useEffect(() => {
        cargarOfertas(filtroModalidad);
    }, [filtroModalidad]);

    const cargarOfertas = async (modalidad) => {
        try {
            const { data } = await OfertasService.listar(modalidad || null);
            setOfertas(data);
            // Si la oferta activa ya no está en la lista, limpiar panel
            if (ofertaActiva && !data.find(o => o.id === ofertaActiva.id)) {
                setOfertaActiva(null);
                setPostulantes([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Seleccionar oferta → cargar postulantes ─────────────────────────────
    const seleccionarOferta = async (oferta) => {
        setOfertaActiva(oferta);
        setCargandoPostulantes(true);
        setPostulantes([]);
        try {
            const { data } = await OfertasService.postulantes(oferta.id);
            setPostulantes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setCargandoPostulantes(false);
        }
    };

    // ─── Cambiar estado de una postulación ───────────────────────────────────
    const cambiarEstado = async (postulacionId, nuevoEstado) => {
        try {
            await PostulacionesService.cambiarEstado(postulacionId, nuevoEstado);
            // Refrescar postulantes
            const { data } = await OfertasService.postulantes(ofertaActiva.id);
            setPostulantes(data);
            // Actualizar detalle si está abierto
            if (detallePostulacion?.id === postulacionId) {
                setDetallePostulacion(prev => ({ ...prev, estado: nuevoEstado }));
            }
        } catch (err) {
            alert('No se pudo actualizar el estado: ' + err.message);
        }
    };

    const salir = () => { cerrar(); navigate('/'); };

    return (
        <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>

            {/* Navbar */}
            <nav className="navbar navbar-dark mb-4" style={{ background: '#0d6efd' }}>
                <div className="container">
                    <span className="navbar-brand mb-0 h1">Tablón de Empleo · Empleador</span>
                    <div>
                        <button className="btn btn-light btn-sm me-2" onClick={() => navigate('/mapa')}>
                            Publicar oferta en el mapa
                        </button>
                        <button className="btn btn-outline-light btn-sm" onClick={salir}>Salir</button>
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row g-4">

                    {/* ── LISTADO DE OFERTAS ─────────────────────────────── */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                Mis ofertas publicadas
                            </div>

                            {/* Filtro */}
                            <div className="card-body p-3 pb-2">
                                <select
                                    className="form-select form-select-sm"
                                    value={filtroModalidad}
                                    onChange={e => setFiltroModalidad(e.target.value)}
                                >
                                    <option value="">Todas las modalidades</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Remoto">Remoto</option>
                                    <option value="Híbrido">Híbrido</option>
                                </select>
                            </div>

                            {/* Lista */}
                            <div
                                className="list-group list-group-flush"
                                style={{ maxHeight: 520, overflowY: 'auto' }}
                            >
                                {ofertas.length === 0 && (
                                    <p className="text-muted p-3 mb-0">
                                        No hay ofertas publicadas todavía.
                                    </p>
                                )}
                                {ofertas.map(o => (
                                    <div
                                        key={o.id}
                                        className="list-group-item"
                                        onClick={() => seleccionarOferta(o)}
                                        style={{
                                            cursor: 'pointer',
                                            borderLeft: ofertaActiva?.id === o.id
                                                ? '4px solid #0d6efd'
                                                : '4px solid transparent',
                                            background: ofertaActiva?.id === o.id ? '#e7f1ff' : 'white',
                                            transition: 'background 0.15s'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 className="mb-1">{o.puesto}</h6>
                                                <p className="text-muted mb-0 small">{o.empresa}</p>
                                            </div>
                                            <span
                                                className="badge"
                                                style={{ background: BADGE_MODALIDAD[o.modalidad] ?? '#6c757d' }}
                                            >
                                                {o.modalidad}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── POSTULANTES ────────────────────────────────────── */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header bg-secondary text-white">
                                {ofertaActiva
                                    ? `Postulantes a: ${ofertaActiva.puesto}`
                                    : 'Seleccioná una oferta para ver sus postulantes'}
                            </div>
                            <div className="card-body">

                                {!ofertaActiva && (
                                    <p className="text-muted">
                                        Elegí una oferta de la lista de la izquierda.
                                    </p>
                                )}

                                {cargandoPostulantes && (
                                    <p className="text-muted">Cargando postulantes...</p>
                                )}

                                {ofertaActiva && !cargandoPostulantes && postulantes.length === 0 && (
                                    <p className="text-muted">Todavía nadie se postuló a esta oferta.</p>
                                )}

                                {postulantes.map(p => (
                                    <div
                                        key={p.id}
                                        className="card mb-3"
                                        style={{ borderLeft: '4px solid #0d6efd' }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="mb-1">{p.Perfil.nombre_apellido}</h6>
                                                    <p className="text-muted mb-0 small">{p.Perfil.domicilio}</p>
                                                </div>
                                                <span
                                                    className="badge"
                                                    style={{ background: ESTADO_COLORES[p.estado] ?? '#6c757d' }}
                                                >
                                                    {p.estado}
                                                </span>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setDetallePostulacion(p)}
                                            >
                                                Ver más detalles
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── MODAL DE DETALLE ───────────────────────────────────────── */}
            {detallePostulacion && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1050
                    }}
                    onClick={e => { if (e.target === e.currentTarget) setDetallePostulacion(null); }}
                >
                    <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>

                        <div
                            className="card-header d-flex justify-content-between align-items-center text-white"
                            style={{ background: '#0d6efd' }}
                        >
                            <h5 className="mb-0">Detalle del postulante</h5>
                            <button
                                className="btn-close btn-close-white"
                                onClick={() => setDetallePostulacion(null)}
                            />
                        </div>

                        <div className="card-body">
                            <h4>{detallePostulacion.Perfil.nombre_apellido}</h4>
                            <p className="text-muted mb-3">
                                Nacimiento:{' '}
                                {new Date(detallePostulacion.Perfil.fecha_nacimiento + 'T00:00:00')
                                    .toLocaleDateString('es-AR')}
                                {' · '}
                                {detallePostulacion.Perfil.domicilio}
                            </p>

                            <h6>Aptitudes</h6>
                            <p>{detallePostulacion.Perfil.aptitudes}</p>

                            <h6>Experiencias</h6>
                            <p>{detallePostulacion.Perfil.experiencias}</p>

                            <hr />

                            <div className="mb-3">
                                <label className="form-label">Estado de la postulación</label>
                                <select
                                    className="form-select"
                                    value={detallePostulacion.estado}
                                    onChange={e => cambiarEstado(detallePostulacion.id, e.target.value)}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Visto">Visto</option>
                                    <option value="Contactado">Contactado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </div>

                            <div className="alert alert-light border small mb-0">
                                La descarga del CV en Word o PDF se habilita en una próxima entrega.
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}