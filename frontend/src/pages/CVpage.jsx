import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../context/sesionContext';
import { PerfilesService, PostulacionesService } from '../services/api';
import SelectorModo from '../components/SelectorModo';

const ESTADO_COLORES = {
    Pendiente:  '#6c757d',
    Visto:      '#0d6efd',
    Contactado: '#198754',
    Rechazado:  '#dc3545'
};

export default function CVPage() {
    const { perfilId, guardarPerfilId } = useSesion();
    const navigate = useNavigate();

    const [perfil,        setPerfil]        = useState(null);
    const [postulaciones, setPostulaciones] = useState([]);
    const [cargando,      setCargando]      = useState(true);
    const [toast,         setToast]         = useState('');
    const [error,         setError]         = useState('');
    const [guardando,     setGuardando]     = useState(false);
    const [form, setForm] = useState({
        nombre_apellido: '', fecha_nacimiento: '',
        domicilio: '', aptitudes: '', experiencias: ''
    });

    useEffect(() => {
        if (perfilId) {
            PerfilesService.obtener(perfilId)
                .then(r => {
                    setPerfil(r.data);
                    setForm({
                        nombre_apellido: r.data.nombre_apellido || '',
                        fecha_nacimiento: r.data.fecha_nacimiento || '',
                        domicilio: r.data.domicilio || '',
                        aptitudes: r.data.aptitudes || '',
                        experiencias: r.data.experiencias || ''
                    });
                    return PostulacionesService.porPerfil(perfilId);
                })
                .then(r => setPostulaciones(r.data))
                .catch(err => setError(err.response?.data?.error || 'No se pudo cargar tu perfil.'))
                .finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, [perfilId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);
        try {
            const { data } = perfil
                ? await PerfilesService.editar(perfil.id, {
                    aptitudes: form.aptitudes,
                    experiencias: form.experiencias
                })
                : await PerfilesService.crear(form);
            if (!perfil) guardarPerfilId(data.id);
            setPerfil(data);
            mostrarToast('CV guardado correctamente.');
        } catch (err) {
            const errores = err.response?.data?.errors;
            setError(errores ? errores.map(e => e.msg).join(', ') : (err.response?.data?.error || 'No se pudo guardar tu CV.'));
        } finally {
            setGuardando(false);
        }
    };

    const mostrarToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    if (cargando) {
        return (
            <div className="tw-flex tw-min-h-screen tw-items-center tw-justify-center tw-bg-slate-50 tw-text-slate-600">
                <span className="tw-mr-3 tw-h-5 tw-w-5 tw-animate-spin tw-rounded-full tw-border-2 tw-border-emerald-600 tw-border-t-transparent" />
                Cargando tu perfil...
            </div>
        );
    }

    return (
        <div className="tw-min-h-screen tw-bg-slate-50 tw-text-slate-800">
            <nav className="tw-bg-gradient-to-r tw-from-emerald-800 tw-to-teal-700 tw-text-white tw-shadow-lg">
                <div className="tw-mx-auto tw-flex tw-max-w-7xl tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-px-5 tw-py-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white/15">
                            <i className="bi bi-person-workspace tw-text-xl" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="tw-m-0 tw-text-lg tw-font-bold">Mano Experta</p>
                            <p className="tw-m-0 tw-text-sm tw-text-emerald-100">Espacio de empleado</p>
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                        <button
                            className="tw-rounded-xl tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-emerald-800 tw-transition hover:tw-bg-emerald-50"
                            onClick={() => navigate('/mapa')}
                        >
                            <i className="bi bi-geo-alt tw-mr-2" aria-hidden="true" />
                            Ver ofertas
                        </button>
                        <SelectorModo />
                    </div>
                </div>
            </nav>

            <main className="tw-mx-auto tw-max-w-7xl tw-px-5 tw-py-8 md:tw-py-10">
                <header className="tw-mb-8">
                    <p className="tw-mb-2 tw-text-sm tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-emerald-700">
                        Tu próxima oportunidad empieza acá
                    </p>
                    <h1 className="tw-mb-2 tw-text-3xl tw-font-extrabold tw-tracking-tight tw-text-slate-900 md:tw-text-4xl">
                        Mi perfil profesional
                    </h1>
                    <p className="tw-m-0 tw-max-w-2xl tw-text-slate-500">
                        Mantené tu información actualizada para que las empresas conozcan tu experiencia y habilidades.
                    </p>
                </header>

                <div className="tw-grid tw-grid-cols-1 tw-items-start tw-gap-6 lg:tw-grid-cols-5">
                    <section className="tw-space-y-5 lg:tw-col-span-3">
                        {error && (
                            <div className="tw-rounded-2xl tw-border tw-border-red-200 tw-bg-red-50 tw-p-4 tw-text-sm tw-font-medium tw-text-red-700" role="alert">
                                <i className="bi bi-exclamation-circle tw-mr-2" aria-hidden="true" />
                                {error}
                            </div>
                        )}
                        {!perfil ? (
                            <div className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm">
                                <div className="tw-border-b tw-border-slate-100 tw-p-6 md:tw-p-7">
                                    <div className="tw-mb-2 tw-flex tw-items-center tw-gap-3">
                                        <span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-emerald-100 tw-text-emerald-700">
                                            <i className="bi bi-file-earmark-person tw-text-xl" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="tw-m-0 tw-text-xl tw-font-bold tw-text-slate-900">Completá tu CV</h2>
                                            <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">Los campos son necesarios para crear tu perfil.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="tw-p-6 md:tw-p-7">
                                    <form onSubmit={handleSubmit}>
                                        {[
                                            { label: 'Nombre y apellido', key: 'nombre_apellido', type: 'text' },
                                            { label: 'Fecha de nacimiento', key: 'fecha_nacimiento', type: 'date' },
                                            { label: 'Dónde te alojás', key: 'domicilio', type: 'text', placeholder: 'Barrio, ciudad' }
                                        ].map(({ label, key, type, placeholder }) => (
                                            <div className="tw-mb-5" key={key}>
                                                <label className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">{label}</label>
                                                <input type={type} className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-bg-white focus:tw-ring-4 focus:tw-ring-emerald-100"
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
                                            <div className="tw-mb-5" key={key}>
                                                <label className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">{label}</label>
                                                <textarea className="tw-w-full tw-resize-y tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-bg-white focus:tw-ring-4 focus:tw-ring-emerald-100" rows={rows}
                                                    placeholder={placeholder}
                                                    value={form[key]}
                                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                    required />
                                            </div>
                                        ))}

                                        <button
                                            type="submit"
                                            className="tw-flex tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-bg-emerald-700 tw-px-5 tw-py-3 tw-font-bold tw-text-white tw-transition hover:tw-bg-emerald-800 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                                            disabled={guardando}
                                        >
                                            <i className={`bi ${guardando ? 'bi-hourglass-split' : 'bi-check2-circle'}`} aria-hidden="true" />
                                            {guardando ? 'Guardando...' : 'Guardar perfil'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm">
                                <div className="tw-bg-gradient-to-br tw-from-emerald-700 tw-to-teal-600 tw-p-6 tw-text-white md:tw-p-8">
                                    <div className="tw-flex tw-items-center tw-gap-4">
                                        <span className="tw-flex tw-h-16 tw-w-16 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white/15 tw-text-2xl tw-font-extrabold">
                                            {perfil.nombre_apellido?.charAt(0)?.toUpperCase()}
                                        </span>
                                        <div>
                                            <p className="tw-mb-1 tw-text-sm tw-font-semibold tw-text-emerald-100">Mi perfil profesional</p>
                                            <h2 className="tw-m-0 tw-text-2xl tw-font-extrabold">{perfil.nombre_apellido}</h2>
                                            <p className="tw-mb-0 tw-mt-2 tw-text-sm tw-text-emerald-50">
                                                <i className="bi bi-geo-alt tw-mr-1" aria-hidden="true" />
                                                {perfil.domicilio}
                                                <span className="tw-mx-2">·</span>
                                                <i className="bi bi-calendar3 tw-mr-1" aria-hidden="true" />
                                                {new Date(perfil.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="tw-p-6 md:tw-p-8">
                                    <p className="tw-mb-6 tw-rounded-xl tw-bg-emerald-50 tw-p-4 tw-text-sm tw-leading-6 tw-text-emerald-900">
                                        <i className="bi bi-info-circle tw-mr-2" aria-hidden="true" />
                                        Los empleadores verán esta información cuando te postules a una oferta.
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="tw-mb-5">
                                            <label className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-slate-700" htmlFor="aptitudes">Aptitudes</label>
                                            <textarea
                                                id="aptitudes"
                                                className="tw-w-full tw-resize-y tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-bg-white focus:tw-ring-4 focus:tw-ring-emerald-100"
                                                rows={4}
                                                placeholder="Ej: manejo de Excel, atención al público..."
                                                value={form.aptitudes}
                                                onChange={e => setForm({ ...form, aptitudes: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="tw-mb-5">
                                            <label className="tw-mb-2 tw-block tw-text-sm tw-font-semibold tw-text-slate-700" htmlFor="experiencias">Experiencias</label>
                                            <textarea
                                                id="experiencias"
                                                className="tw-w-full tw-resize-y tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-bg-white focus:tw-ring-4 focus:tw-ring-emerald-100"
                                                rows={5}
                                                placeholder="Contá tus trabajos anteriores, tareas realizadas y logros."
                                                value={form.experiencias}
                                                onChange={e => setForm({ ...form, experiencias: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="tw-flex tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-bg-emerald-700 tw-px-5 tw-py-3 tw-font-bold tw-text-white tw-transition hover:tw-bg-emerald-800 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                                            disabled={guardando}
                                        >
                                            <i className={`bi ${guardando ? 'bi-hourglass-split' : 'bi-check2-circle'}`} aria-hidden="true" />
                                            {guardando ? 'Guardando...' : 'Guardar CV'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm lg:tw-col-span-2">
                        <div className="tw-border-b tw-border-slate-100 tw-p-6">
                            <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                                <div>
                                    <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-slate-900">Mis postulaciones</h2>
                                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">Seguimiento de tus oportunidades</p>
                                </div>
                                <span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-blue-50 tw-text-blue-700">
                                    <i className="bi bi-send tw-text-lg" aria-hidden="true" />
                                </span>
                            </div>
                        </div>
                        <div className="tw-space-y-3 tw-p-5">
                                {!perfil && <p className="tw-m-0 tw-rounded-xl tw-bg-slate-50 tw-p-4 tw-text-sm tw-text-slate-500">Cargá tu perfil primero.</p>}
                                {perfil && postulaciones.length === 0 && (
                                    <div className="tw-rounded-2xl tw-bg-slate-50 tw-px-5 tw-py-8 tw-text-center">
                                        <i className="bi bi-inbox tw-text-3xl tw-text-slate-300" aria-hidden="true" />
                                        <p className="tw-mb-0 tw-mt-3 tw-text-sm tw-text-slate-500">Todavía no te postulaste a ninguna oferta.</p>
                                    </div>
                                )}
                                {postulaciones.map(p => (
                                    <article className="tw-rounded-2xl tw-border tw-border-slate-200 tw-border-l-4 tw-bg-white tw-p-4 tw-shadow-sm" key={p.id}
                                        style={{ borderLeftColor: ESTADO_COLORES[p.estado] ?? '#6c757d' }}>
                                        <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                                            <div className="tw-min-w-0">
                                                <h3 className="tw-m-0 tw-truncate tw-text-sm tw-font-bold tw-text-slate-900">{p.Oferta?.puesto || 'Oferta no disponible'}</h3>
                                                <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-slate-500">
                                                    {p.Oferta?.empresa || 'Empresa no disponible'} <span className="tw-mx-1">·</span> {p.Oferta?.modalidad || 'Modalidad no disponible'}
                                                    </p>
                                            </div>
                                            <span className="tw-shrink-0 tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-white" style={{ background: ESTADO_COLORES[p.estado] ?? '#6c757d' }}>
                                                {p.estado}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                        </div>
                    </aside>
                </div>
            </main>

            {toast && (
                <div className="tw-fixed tw-bottom-6 tw-left-1/2 tw-z-[9999] tw-flex tw--translate-x-1/2 tw-items-center tw-gap-2 tw-rounded-xl tw-bg-emerald-800 tw-px-5 tw-py-3 tw-font-semibold tw-text-white tw-shadow-xl" role="status">
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    {toast}
                </div>
            )}
        </div>
    );
}