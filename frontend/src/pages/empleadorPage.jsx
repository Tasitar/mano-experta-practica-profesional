import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import { OfertasService, PostulacionesService } from '../services/api';
import SelectorModo from '../components/SelectorModo';

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

const descargarCvPdf = async (perfil) => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const anchoTexto = 170;
    const altoPagina = pdf.internal.pageSize.getHeight();
    let y = 55;

    pdf.setFillColor(30, 82, 72);
    pdf.rect(0, 0, 210, 43, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(21);
    pdf.text(perfil.nombre_apellido || 'Currículum', 20, 22);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Currículum Vitae', 20, 33);
    pdf.setTextColor(45, 55, 72);
    pdf.setFontSize(10);
    pdf.text(`Fecha de nacimiento: ${perfil.fecha_nacimiento ? new Date(`${perfil.fecha_nacimiento}T00:00:00`).toLocaleDateString('es-AR') : 'No informada'}`, 20, y);
    y += 7;
    pdf.text(`Domicilio: ${perfil.domicilio || 'No informado'}`, 20, y);
    y += 7;
    pdf.text(`Teléfono: ${perfil.telefono || 'No informado'}`, 20, y);
    y += 13;

    const agregarSeccion = (titulo, contenido) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(30, 82, 72);
        if (y + 12 > altoPagina - 18) {
            pdf.addPage();
            y = 20;
        }
        pdf.text(titulo, 20, y);
        y += 7;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const lineas = pdf.splitTextToSize(contenido || 'No informado', anchoTexto);
        lineas.forEach(linea => {
            if (y + 6 > altoPagina - 18) {
                pdf.addPage();
                y = 20;
            }
            pdf.text(linea, 20, y);
            y += 6;
        });
        y += 8;
    };

    agregarSeccion('Aptitudes', perfil.aptitudes);
    agregarSeccion('Experiencias', perfil.experiencias);

    const nombreArchivo = (perfil.nombre_apellido || 'postulante')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-|-$/g, '');
    pdf.save(`CV-${nombreArchivo || 'postulante'}.pdf`);
};

export default function EmpleadorPage() {
    const navigate   = useNavigate();
    const { perfilId } = useSesion();

    const [ofertas,           setOfertas]           = useState([]);
    const [filtroModalidad,   setFiltroModalidad]   = useState('');
    const [ofertaActiva,      setOfertaActiva]      = useState(null);
    const [postulantes,       setPostulantes]       = useState([]);
    const [cargandoPostulantes, setCargandoPostulantes] = useState(false);
    const [detallePostulacion,  setDetallePostulacion]  = useState(null);
    const [eliminandoOferta, setEliminandoOferta] = useState(null);

    // ─── Cargar ofertas ──────────────────────────────────────────────────────
    useEffect(() => {
        let cancelado = false;
        setOfertaActiva(null);
        setPostulantes([]);

        if (!perfilId) {
            setOfertas([]);
            return () => { cancelado = true; };
        }

        OfertasService.listar(filtroModalidad || null, perfilId)
            .then(({ data }) => {
                if (!cancelado) setOfertas(data);
            })
            .catch(err => {
                if (!cancelado) console.error(err);
            });

        return () => { cancelado = true; };
    }, [filtroModalidad, perfilId]);

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

    const eliminarOferta = async (oferta) => {
        if (!window.confirm(`¿Querés eliminar la oferta "${oferta.puesto}"? También se borrarán sus postulaciones.`)) return;

        setEliminandoOferta(oferta.id);
        try {
            await OfertasService.eliminar(oferta.id, perfilId);
            setOfertas(actuales => actuales.filter(item => item.id !== oferta.id));
            if (ofertaActiva?.id === oferta.id) {
                setOfertaActiva(null);
                setPostulantes([]);
                setDetallePostulacion(null);
            }
        } catch (err) {
            alert(err.response?.data?.error || 'No se pudo eliminar la oferta.');
        } finally {
            setEliminandoOferta(null);
        }
    };

    const handleDescargarCv = async () => {
        try {
            await descargarCvPdf(detallePostulacion.Perfil);
        } catch (error) {
            console.error('No se pudo generar el PDF del CV:', error);
            alert('No se pudo generar el PDF. Intentá nuevamente.');
        }
    };

    return (
        <div className="tw-min-h-screen tw-bg-slate-50 tw-text-slate-800">

            <nav className="tw-bg-gradient-to-r tw-from-blue-900 tw-to-indigo-700 tw-text-white tw-shadow-lg">
                <div className="tw-mx-auto tw-flex tw-max-w-7xl tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-px-5 tw-py-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white/15">
                            <i className="bi bi-building tw-text-xl" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="tw-m-0 tw-text-lg tw-font-bold">Mano Experta</p>
                            <p className="tw-m-0 tw-text-sm tw-text-blue-100">Panel de empleador</p>
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                        <button
                            className="tw-rounded-xl tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-blue-800 tw-transition hover:tw-bg-blue-50"
                            onClick={() => navigate('/mapa')}
                        >
                            <i className="bi bi-plus-circle tw-mr-2" aria-hidden="true" />
                            Publicar oferta
                        </button>
                        <SelectorModo />
                    </div>
                </div>
            </nav>

            <main className="tw-mx-auto tw-max-w-7xl tw-px-5 tw-py-8 md:tw-py-10">
                <header className="tw-mb-8">
                    <p className="tw-mb-2 tw-text-sm tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-blue-700">
                        Encontrá el talento que buscás
                    </p>
                    <h1 className="tw-mb-2 tw-text-3xl tw-font-extrabold tw-tracking-tight tw-text-slate-900 md:tw-text-4xl">
                        Gestión de postulaciones
                    </h1>
                    <p className="tw-m-0 tw-max-w-2xl tw-text-slate-500">
                        Revisá tus avisos publicados y conocé a las personas interesadas en cada oportunidad.
                    </p>
                </header>

                <div className="tw-grid tw-grid-cols-1 tw-items-start tw-gap-6 lg:tw-grid-cols-5">
                    <aside className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm lg:tw-col-span-2">
                        <div className="tw-border-b tw-border-slate-100 tw-p-6">
                            <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                                <div>
                                    <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-slate-900">Mis ofertas</h2>
                                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">{ofertas.length} publicadas</p>
                                </div>
                                <span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-blue-50 tw-text-blue-700">
                                    <i className="bi bi-briefcase tw-text-lg" aria-hidden="true" />
                                </span>
                            </div>
                        </div>

                        <div className="tw-p-4">
                            <label className="tw-mb-2 tw-block tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider tw-text-slate-500" htmlFor="filtro-modalidad">
                                Filtrar por modalidad
                            </label>
                            <select
                                id="filtro-modalidad"
                                className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-3 tw-py-2.5 tw-text-sm tw-text-slate-700 tw-outline-none focus:tw-border-blue-500 focus:tw-ring-4 focus:tw-ring-blue-100"
                                value={filtroModalidad}
                                onChange={e => setFiltroModalidad(e.target.value)}
                            >
                                <option value="">Todas las modalidades</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Remoto">Remoto</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>

                        <div className="tw-max-h-[520px] tw-space-y-2 tw-overflow-y-auto tw-px-3 tw-pb-4">
                            {ofertas.length === 0 && (
                                <div className="tw-rounded-2xl tw-bg-slate-50 tw-px-5 tw-py-8 tw-text-center">
                                    <i className="bi bi-briefcase tw-text-3xl tw-text-slate-300" aria-hidden="true" />
                                    <p className="tw-mb-0 tw-mt-3 tw-text-sm tw-text-slate-500">No hay ofertas publicadas todavía.</p>
                                </div>
                            )}
                            {ofertas.map(o => {
                                const activa = ofertaActiva?.id === o.id;
                                return (
                                    <article
                                        key={o.id}
                                        className={`tw-flex tw-items-center tw-gap-2 tw-rounded-2xl tw-border tw-p-2 tw-transition ${
                                            activa
                                                ? 'tw-border-blue-200 tw-bg-blue-50 tw-shadow-sm'
                                                : 'tw-border-slate-100 tw-bg-white'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="tw-min-w-0 tw-flex-1 tw-rounded-xl tw-p-2 tw-text-left tw-transition hover:tw-bg-slate-50"
                                            onClick={() => seleccionarOferta(o)}
                                            aria-pressed={activa}
                                        >
                                            <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                                                <div className="tw-min-w-0">
                                                    <h3 className="tw-m-0 tw-truncate tw-text-sm tw-font-bold tw-text-slate-900">{o.puesto}</h3>
                                                    <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-slate-500">{o.empresa}</p>
                                                </div>
                                                <span
                                                    className="tw-shrink-0 tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-white"
                                                    style={{ background: BADGE_MODALIDAD[o.modalidad] ?? '#6c757d' }}
                                                >
                                                    {o.modalidad}
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className="tw-shrink-0 tw-rounded-xl tw-border tw-border-red-200 tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-red-700 tw-transition hover:tw-bg-red-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                                            onClick={() => eliminarOferta(o)}
                                            disabled={eliminandoOferta === o.id}
                                            aria-label={`Eliminar oferta ${o.puesto}`}
                                            title="Eliminar oferta"
                                        >
                                            <i className={`bi ${eliminandoOferta === o.id ? 'bi-hourglass-split' : 'bi-trash'}`} aria-hidden="true" />
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm lg:tw-col-span-3">
                        <div className="tw-border-b tw-border-slate-100 tw-p-6">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <span className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-indigo-50 tw-text-indigo-700">
                                    <i className="bi bi-people tw-text-lg" aria-hidden="true" />
                                </span>
                                <div className="tw-min-w-0">
                                    <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-slate-900">
                                        {ofertaActiva ? `Postulantes a: ${ofertaActiva.puesto}` : 'Postulantes'}
                                    </h2>
                                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">
                                        {ofertaActiva ? 'Personas interesadas en esta oportunidad' : 'Seleccioná una oferta para ver las postulaciones'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="tw-space-y-3 tw-p-5 md:tw-p-6">
                            {!ofertaActiva && (
                                <div className="tw-rounded-2xl tw-bg-slate-50 tw-px-5 tw-py-10 tw-text-center">
                                    <i className="bi bi-arrow-left-circle tw-text-3xl tw-text-slate-300" aria-hidden="true" />
                                    <p className="tw-mb-0 tw-mt-3 tw-text-sm tw-text-slate-500">Elegí una oferta de la lista para revisar sus postulantes.</p>
                                </div>
                            )}
                            {cargandoPostulantes && (
                                <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-py-10 tw-text-sm tw-text-slate-500">
                                    <span className="tw-h-5 tw-w-5 tw-animate-spin tw-rounded-full tw-border-2 tw-border-blue-600 tw-border-t-transparent" />
                                    Cargando postulantes...
                                </div>
                            )}
                            {ofertaActiva && !cargandoPostulantes && postulantes.length === 0 && (
                                <div className="tw-rounded-2xl tw-bg-slate-50 tw-px-5 tw-py-10 tw-text-center">
                                    <i className="bi bi-inbox tw-text-3xl tw-text-slate-300" aria-hidden="true" />
                                    <p className="tw-mb-0 tw-mt-3 tw-text-sm tw-text-slate-500">Todavía nadie se postuló a esta oferta.</p>
                                </div>
                            )}
                            {postulantes.map(p => (
                                <article
                                    key={p.id}
                                    className="tw-rounded-2xl tw-border tw-border-slate-200 tw-border-l-4 tw-bg-white tw-p-5 tw-transition hover:tw-shadow-sm"
                                    style={{ borderLeftColor: '#0d6efd' }}
                                >
                                    <div className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                            <span className="tw-flex tw-h-11 tw-w-11 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-blue-50 tw-font-bold tw-text-blue-700">
                                                {p.Perfil.nombre_apellido?.charAt(0)?.toUpperCase()}
                                            </span>
                                            <div>
                                                <h3 className="tw-m-0 tw-text-sm tw-font-bold tw-text-slate-900">{p.Perfil.nombre_apellido}</h3>
                                                <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-slate-500">
                                                    <i className="bi bi-geo-alt tw-mr-1" aria-hidden="true" />
                                                    {p.Perfil.domicilio}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className="tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-white"
                                            style={{ background: ESTADO_COLORES[p.estado] ?? '#6c757d' }}
                                        >
                                            {p.estado}
                                        </span>
                                        <button
                                            type="button"
                                            className="tw-w-full tw-rounded-xl tw-border tw-border-blue-200 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-blue-700 tw-transition hover:tw-bg-blue-50 sm:tw-w-auto"
                                            onClick={() => setDetallePostulacion(p)}
                                        >
                                            <i className="bi bi-person-vcard tw-mr-2" aria-hidden="true" />
                                            Ver perfil completo
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* ── MODAL DE DETALLE ───────────────────────────────────────── */}
            {detallePostulacion && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-[1050] tw-flex tw-items-center tw-justify-center tw-bg-slate-950/60 tw-p-4 tw-backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget) setDetallePostulacion(null); }}
                >
                    <div className="tw-max-h-[90vh] tw-w-full tw-max-w-xl tw-overflow-y-auto tw-rounded-3xl tw-bg-white tw-shadow-2xl">
                        <div className="tw-flex tw-items-center tw-justify-between tw-bg-gradient-to-r tw-from-blue-800 tw-to-indigo-700 tw-px-6 tw-py-5 tw-text-white">
                            <div>
                                <p className="tw-m-0 tw-text-sm tw-font-semibold tw-text-blue-100">Perfil del candidato</p>
                                <h2 className="tw-m-0 tw-mt-1 tw-text-xl tw-font-bold">Detalle del postulante</h2>
                            </div>
                            <button
                                type="button"
                                className="tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-bg-white/15 tw-text-xl tw-text-white tw-transition hover:tw-bg-white/25"
                                onClick={() => setDetallePostulacion(null)}
                                aria-label="Cerrar detalle"
                            >
                                <i className="bi bi-x-lg" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="tw-space-y-5 tw-p-6">
                            <div>
                                <h3 className="tw-m-0 tw-text-2xl tw-font-extrabold tw-text-slate-900">{detallePostulacion.Perfil.nombre_apellido}</h3>
                                <p className="tw-mb-0 tw-mt-2 tw-text-sm tw-text-slate-500">
                                    <i className="bi bi-calendar3 tw-mr-1" aria-hidden="true" />
                                    {new Date(detallePostulacion.Perfil.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                                    <span className="tw-mx-2">·</span>
                                    <i className="bi bi-geo-alt tw-mr-1" aria-hidden="true" />
                                    {detallePostulacion.Perfil.domicilio}
                                </p>
                                <p className="tw-mb-0 tw-mt-2 tw-text-sm tw-font-medium">
                                    <i className="bi bi-telephone tw-mr-1" aria-hidden="true" />
                                    {detallePostulacion.Perfil.telefono ? (
                                        <a
                                            className="tw-text-blue-700 tw-underline"
                                            href={`tel:${detallePostulacion.Perfil.telefono.replace(/[^\d+]/g, '')}`}
                                        >
                                            {detallePostulacion.Perfil.telefono}
                                        </a>
                                    ) : (
                                        <span className="tw-text-slate-500">Teléfono no informado</span>
                                    )}
                                </p>
                            </div>

                            <div className="tw-rounded-2xl tw-bg-slate-50 tw-p-4">
                                <h4 className="tw-mb-2 tw-text-sm tw-font-bold tw-text-slate-800">Aptitudes</h4>
                                <p className="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-text-sm tw-leading-6 tw-text-slate-600">
                                    {detallePostulacion.Perfil.aptitudes || 'El postulante todavía no cargó sus aptitudes.'}
                                </p>
                            </div>

                            <div className="tw-rounded-2xl tw-bg-slate-50 tw-p-4">
                                <h4 className="tw-mb-2 tw-text-sm tw-font-bold tw-text-slate-800">Experiencias</h4>
                                <p className="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-text-sm tw-leading-6 tw-text-slate-600">
                                    {detallePostulacion.Perfil.experiencias || 'El postulante todavía no cargó sus experiencias.'}
                                </p>
                            </div>

                            <div>
                                <label className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">Estado de la postulación</label>
                                <select
                                    className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-3 tw-text-slate-700 tw-outline-none focus:tw-border-blue-500 focus:tw-ring-4 focus:tw-ring-blue-100"
                                    value={detallePostulacion.estado}
                                    onChange={e => cambiarEstado(detallePostulacion.id, e.target.value)}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Visto">Visto</option>
                                    <option value="Contactado">Contactado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="tw-flex tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-bg-blue-700 tw-px-5 tw-py-3 tw-font-bold tw-text-white tw-transition hover:tw-bg-blue-800"
                                onClick={handleDescargarCv}
                            >
                                <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                                Descargar CV en PDF
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}