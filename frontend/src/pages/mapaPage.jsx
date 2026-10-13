import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useSesion } from '../context/sesionContext';
import { OfertasService, PerfilesService, PostulacionesService } from '../services/api';
import SelectorModo from '../components/SelectorModo';
import 'leaflet/dist/leaflet.css';

const COLORES = {
    Presencial: '#0d6efd',
    Remoto:     '#198754',
    'Híbrido':  '#fd7e14'
};

// Componente interno para capturar clicks en el mapa
function ClickHandler({ onMapClick, activo }) {
    useMapEvents({
        click: (e) => {
            if (activo) onMapClick(e.latlng);
        }
    });
    return null;
}

function MoverAlPuesto({ oferta }) {
    const map = useMap();

    useEffect(() => {
        if (!oferta) return;
        map.flyTo(
            [parseFloat(oferta.latitud), parseFloat(oferta.longitud)],
            Math.max(map.getZoom(), 15),
            { duration: 0.8 }
        );
    }, [map, oferta]);

    return null;
}

export default function MapaPage() {
    const { rol, perfilId } = useSesion();
    const navigate   = useNavigate();
    const esEmpleador = rol === 'empleador';
    const esEmpleado  = rol === 'empleado';

    const [ofertas, setOfertas]             = useState([]);
    const [coordSeleccionada, setCoord]     = useState(null);
    const [filtroModalidad, setFiltroModalidad] = useState('');
    const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
    const [form, setForm]                   = useState({ puesto: '', empresa: '', modalidad: 'Presencial', descripcion: '' });
    const [toast, setToast]                 = useState('');

    const ofertasFiltradas = ofertas.filter(oferta =>
        !filtroModalidad || oferta.modalidad === filtroModalidad
    );
    const ofertasEnMapa = esEmpleado ? ofertasFiltradas : ofertas;

    useEffect(() => {
        OfertasService.listar()
            .then(r => setOfertas(r.data))
            .catch(console.error);
    }, []);

    const handleMapClick = (latlng) => {
        setCoord(latlng);
    };

    const seleccionarOferta = (oferta) => {
        setOfertaSeleccionada(oferta);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coordSeleccionada) {
            alert('Seleccioná un punto en el mapa primero.');
            return;
        }
        try {
            const { data } = await OfertasService.crear({
                ...form,
                empleador_id: perfilId,
                latitud:  coordSeleccionada.lat,
                longitud: coordSeleccionada.lng
            });
            setOfertas(prev => [data, ...prev]);
            setForm({ puesto: '', empresa: '', modalidad: 'Presencial', descripcion: '' });
            setCoord(null);
            mostrarToast(`✅ Oferta "${data.puesto}" publicada correctamente.`);
        } catch (err) {
            const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || err.message;
            alert('Error: ' + msg);
        }
    };

    const aplicar = async (ofertaId) => {
        if (!perfilId) {
            alert('Primero cargá tu perfil/CV.');
            navigate('/cv');
            return;
        }
        try {
            const { data: perfil } = await PerfilesService.obtener(perfilId);
            if (!perfil.aptitudes?.trim() || !perfil.experiencias?.trim()) {
                alert('Completá y guardá tus aptitudes y experiencias en tu CV antes de postularte.');
                navigate('/cv');
                return;
            }
        } catch (err) {
            alert(err.response?.data?.error || 'No se pudo verificar tu CV. Intentá nuevamente.');
            return;
        }
        try {
            await PostulacionesService.crear(perfilId, ofertaId);
            mostrarToast('✅ Te postulaste correctamente.');
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            mostrarToast(msg);
        }
    };

    const mostrarToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="tw-min-h-screen tw-bg-slate-50 tw-text-slate-800">
            <nav className="tw-bg-gradient-to-r tw-from-blue-950 tw-via-blue-900 tw-to-indigo-800 tw-text-white tw-shadow-lg">
                <div className="tw-mx-auto tw-flex tw-max-w-7xl tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-px-5 tw-py-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white/15">
                            <i className="bi bi-geo-alt-fill tw-text-xl" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="tw-m-0 tw-text-lg tw-font-bold">Mano Experta</p>
                            <p className="tw-m-0 tw-text-sm tw-text-blue-100">
                                {esEmpleador ? 'Publicá oportunidades en tu zona' : 'Encontrá oportunidades cerca tuyo'}
                            </p>
                        </div>
                    </div>
                    <SelectorModo />
                </div>
            </nav>

            <main className="tw-mx-auto tw-max-w-7xl tw-px-5 tw-py-8 md:tw-py-10">
                <header className="tw-mb-7 tw-flex tw-flex-col tw-justify-between tw-gap-5 md:tw-flex-row md:tw-items-end">
                    <div>
                        <p className="tw-mb-2 tw-text-sm tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-blue-700">
                            {esEmpleador ? 'Conectá con talento local' : 'Tu próximo trabajo puede estar cerca'}
                        </p>
                        <h1 className="tw-mb-2 tw-text-3xl tw-font-extrabold tw-tracking-tight tw-text-slate-900 md:tw-text-4xl">
                            {esEmpleador ? 'Publicá por ubicación' : 'Ofertas en el mapa'}
                        </h1>
                        <p className="tw-m-0 tw-max-w-2xl tw-text-slate-500">
                            {esEmpleador
                                ? 'Elegí un punto en Formosa, completá los datos y hacé visible tu búsqueda.'
                                : 'Explorá las oportunidades laborales de Formosa y postuláte directamente desde cada aviso.'}
                        </p>
                    </div>
                    <div className="tw-flex tw-w-fit tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-blue-100 tw-bg-white tw-px-4 tw-py-3 tw-shadow-sm">
                        <span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-blue-50 tw-text-blue-700">
                            <i className="bi bi-briefcase-fill tw-text-lg" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="tw-m-0 tw-text-xl tw-font-extrabold tw-leading-5 tw-text-slate-900">{ofertas.length}</p>
                            <p className="tw-m-0 tw-mt-1 tw-text-xs tw-font-medium tw-text-slate-500">ofertas publicadas</p>
                        </div>
                    </div>
                </header>

                <div className="tw-grid tw-grid-cols-1 tw-items-start tw-gap-6 lg:tw-grid-cols-5">
                    <section className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm lg:tw-col-span-3">
                        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-slate-100 tw-px-5 tw-py-4 md:tw-px-6">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-blue-50 tw-text-blue-700">
                                    <i className="bi bi-map tw-text-lg" aria-hidden="true" />
                                </span>
                                <div>
                                    <h2 className="tw-m-0 tw-text-base tw-font-bold tw-text-slate-900">Mapa de Formosa</h2>
                                    <p className="tw-m-0 tw-mt-0.5 tw-text-xs tw-text-slate-500">
                                        {esEmpleador ? 'Hacé clic para marcar la ubicación de tu oferta' : 'Seleccioná un marcador para ver los detalles'}
                                    </p>
                                </div>
                            </div>
                            <span className="tw-rounded-full tw-bg-emerald-50 tw-px-3 tw-py-1.5 tw-text-xs tw-font-semibold tw-text-emerald-700">
                                <i className="bi bi-broadcast tw-mr-1" aria-hidden="true" />
                                Formosa, Argentina
                            </span>
                        </div>
                        <div className="tw-p-2 md:tw-p-3">
                            <MapContainer
                                center={[-26.1849, -58.1731]}
                                zoom={13}
                                style={{ height: 'min(62vh, 560px)', minHeight: '380px', width: '100%', cursor: esEmpleador ? 'crosshair' : 'default', borderRadius: '1rem' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />

                                <ClickHandler onMapClick={handleMapClick} activo={esEmpleador} />
                                <MoverAlPuesto oferta={ofertaSeleccionada} />

                                {coordSeleccionada && (
                                    <CircleMarker
                                        center={[coordSeleccionada.lat, coordSeleccionada.lng]}
                                        radius={8}
                                        pathOptions={{ color: '#64748b', fillColor: '#94a3b8', fillOpacity: 0.9 }}
                                    >
                                        <Popup>📍 Ubicación seleccionada</Popup>
                                    </CircleMarker>
                                )}

                                {ofertasEnMapa.map(o => {
                                    const color = COLORES[o.modalidad] ?? '#64748b';
                                    return (
                                        <div key={o.id}>
                                            <Circle
                                                center={[parseFloat(o.latitud), parseFloat(o.longitud)]}
                                                radius={300}
                                                pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 1.5 }}
                                            />
                                            <CircleMarker
                                                center={[parseFloat(o.latitud), parseFloat(o.longitud)]}
                                                radius={10}
                                                pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                                            >
                                                <Popup>
                                                    <div className="tw-min-w-[200px] tw-p-1">
                                                        <p className="tw-m-0 tw-text-base tw-font-bold tw-text-slate-900">{o.puesto}</p>
                                                        <p className="tw-mb-1 tw-mt-2 tw-text-sm tw-text-slate-600">
                                                            <i className="bi bi-building tw-mr-1" aria-hidden="true" />{o.empresa}
                                                        </p>
                                                        <p className="tw-mb-2 tw-mt-0 tw-text-sm tw-leading-5 tw-text-slate-600">
                                                            <i className="bi bi-card-text tw-mr-1" aria-hidden="true" />{o.descripcion}
                                                        </p>
                                                        <span className="tw-inline-flex tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-white" style={{ background: color }}>
                                                            {o.modalidad}
                                                        </span>
                                                        {esEmpleado && (
                                                            <button
                                                                type="button"
                                                                className="tw-mt-3 tw-w-full tw-rounded-lg tw-bg-emerald-700 tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-emerald-800"
                                                                onClick={() => aplicar(o.id)}
                                                            >
                                                                <i className="bi bi-send-fill tw-mr-2" aria-hidden="true" />
                                                                Aplicar a este empleo
                                                            </button>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        </div>
                                    );
                                })}
                            </MapContainer>
                        </div>
                        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-5 tw-gap-y-2 tw-border-t tw-border-slate-100 tw-px-5 tw-py-3 md:tw-px-6">
                            <span className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-slate-400">Modalidad</span>
                            {Object.entries(COLORES).map(([modalidad, color]) => (
                                <span key={modalidad} className="tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-font-medium tw-text-slate-600">
                                    <span className="tw-h-2.5 tw-w-2.5 tw-rounded-full" style={{ background: color }} />
                                    {modalidad}
                                </span>
                            ))}
                        </div>
                    </section>

                    <aside className="tw-space-y-5 lg:tw-col-span-2">
                        {esEmpleador && (
                            <section className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm">
                                <div className="tw-bg-gradient-to-r tw-from-emerald-700 tw-to-teal-600 tw-px-6 tw-py-5 tw-text-white">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white/15">
                                            <i className="bi bi-plus-lg tw-text-xl" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="tw-m-0 tw-text-lg tw-font-bold">Nueva oferta laboral</h2>
                                            <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-emerald-50">Completá los datos del puesto</p>
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="tw-space-y-4 tw-p-5 md:tw-p-6">
                                    <div>
                                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">Puesto</label>
                                        <input
                                            className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-ring-4 focus:tw-ring-emerald-100"
                                            value={form.puesto}
                                            onChange={e => setForm({ ...form, puesto: e.target.value })}
                                            placeholder="Ej. Electricista"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">Empresa</label>
                                        <input
                                            className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition placeholder:tw-text-slate-400 focus:tw-border-emerald-500 focus:tw-ring-4 focus:tw-ring-emerald-100"
                                            value={form.empresa}
                                            onChange={e => setForm({ ...form, empresa: e.target.value })}
                                            placeholder="Nombre de la empresa"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">Modalidad</label>
                                        <select
                                            className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-text-slate-800 tw-outline-none focus:tw-border-emerald-500 focus:tw-ring-4 focus:tw-ring-emerald-100"
                                            value={form.modalidad}
                                            onChange={e => setForm({ ...form, modalidad: e.target.value })}
                                        >
                                            <option>Presencial</option>
                                            <option>Remoto</option>
                                            <option>Híbrido</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">Descripción</label>
                                        <textarea
                                            className="tw-w-full tw-resize-y tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-leading-6 tw-text-slate-800 tw-outline-none focus:tw-border-emerald-500 focus:tw-ring-4 focus:tw-ring-emerald-100"
                                            rows={4}
                                            value={form.descripcion}
                                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                            placeholder="Contá brevemente las tareas y requisitos"
                                            required
                                        />
                                    </div>
                                    <div className={`tw-rounded-xl tw-border tw-p-3.5 ${coordSeleccionada ? 'tw-border-emerald-200 tw-bg-emerald-50' : 'tw-border-amber-200 tw-bg-amber-50'}`}>
                                        <p className={`tw-m-0 tw-mb-1 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide ${coordSeleccionada ? 'tw-text-emerald-700' : 'tw-text-amber-700'}`}>
                                            <i className={`bi ${coordSeleccionada ? 'bi-geo-alt-fill' : 'bi-cursor-fill'} tw-mr-1`} aria-hidden="true" />
                                            Ubicación en el mapa
                                        </p>
                                        <p className={`tw-m-0 tw-text-sm ${coordSeleccionada ? 'tw-text-emerald-800' : 'tw-text-amber-800'}`}>
                                            {coordSeleccionada
                                                ? `Lat: ${coordSeleccionada.lat.toFixed(5)}, Lng: ${coordSeleccionada.lng.toFixed(5)}`
                                                : 'Hacé clic en el mapa para elegir un punto'}
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="tw-w-full tw-rounded-xl tw-bg-emerald-700 tw-px-4 tw-py-3 tw-font-bold tw-text-white tw-shadow-sm tw-transition hover:tw-bg-emerald-800 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-emerald-200"
                                    >
                                        <i className="bi bi-megaphone-fill tw-mr-2" aria-hidden="true" />
                                        Publicar oferta
                                    </button>
                                </form>
                            </section>
                        )}

                        {esEmpleado && (
                            <>
                                <section className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm">
                                    <div className="tw-border-b tw-border-slate-100 tw-p-5">
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                            <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-blue-50 tw-text-blue-700">
                                                <i className="bi bi-search tw-text-xl" aria-hidden="true" />
                                            </span>
                                            <div>
                                                <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-slate-900">Buscar oportunidades</h2>
                                                <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">{ofertasFiltradas.length} ofertas encontradas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tw-p-5">
                                        <div>
                                            <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700" htmlFor="filtro-modalidad-mapa">Modalidad</label>
                                            <select
                                                id="filtro-modalidad-mapa"
                                                className="tw-w-full tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-3 tw-py-2.5 tw-text-sm tw-text-slate-700 tw-outline-none focus:tw-border-blue-500 focus:tw-ring-4 focus:tw-ring-blue-100"
                                                value={filtroModalidad}
                                                onChange={e => setFiltroModalidad(e.target.value)}
                                            >
                                                <option value="">Todas las modalidades</option>
                                                {Object.keys(COLORES).map(modalidad => (
                                                    <option key={modalidad} value={modalidad}>{modalidad}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="tw-max-h-[28rem] tw-space-y-3 tw-overflow-y-auto tw-border-t tw-border-slate-100 tw-p-4">
                                        {ofertasFiltradas.length === 0 ? (
                                            <p className="tw-m-0 tw-rounded-2xl tw-bg-slate-50 tw-p-5 tw-text-center tw-text-sm tw-text-slate-500">
                                                No hay ofertas que coincidan con esos filtros.
                                            </p>
                                        ) : ofertasFiltradas.map(oferta => {
                                            const color = COLORES[oferta.modalidad] ?? '#64748b';
                                            return (
                                                <article
                                                    key={oferta.id}
                                                    className="tw-cursor-pointer tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-4 tw-transition hover:tw-border-blue-200 hover:tw-shadow-sm"
                                                    onClick={() => seleccionarOferta(oferta)}
                                                >
                                                    <p className="tw-m-0 tw-text-base tw-font-bold tw-text-slate-900">{oferta.puesto}</p>
                                                    <p className="tw-mb-1 tw-mt-2 tw-text-sm tw-text-slate-600">
                                                        <i className="bi bi-building tw-mr-1" aria-hidden="true" />{oferta.empresa}
                                                    </p>
                                                    <p className="tw-mb-2 tw-mt-0 tw-whitespace-pre-wrap tw-break-words tw-text-sm tw-leading-5 tw-text-slate-600">
                                                        <i className="bi bi-card-text tw-mr-1" aria-hidden="true" />{oferta.descripcion}
                                                    </p>
                                                    <span className="tw-inline-flex tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-white" style={{ background: color }}>
                                                        {oferta.modalidad}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="tw-mt-3 tw-w-full tw-rounded-lg tw-bg-emerald-700 tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-emerald-800"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            aplicar(oferta.id);
                                                        }}
                                                    >
                                                        <i className="bi bi-send-fill tw-mr-2" aria-hidden="true" />
                                                        Aplicar a este empleo
                                                    </button>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className="tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-sm">
                                    <div className="tw-border-b tw-border-slate-100 tw-p-5">
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                            <span className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-emerald-50 tw-text-emerald-700">
                                                <i className="bi bi-compass-fill tw-text-xl" aria-hidden="true" />
                                            </span>
                                            <div>
                                                <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-slate-900">¿Cómo postularte?</h2>
                                                <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-slate-500">Tres pasos para acercarte a tu próximo trabajo</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tw-space-y-4 tw-p-5">
                                        {[
                                            ['1', 'Explorá el mapa', 'Los puntos muestran dónde están las oportunidades.'],
                                            ['2', 'Abrí una oferta', 'Seleccioná un marcador para conocer el puesto y la empresa.'],
                                            ['3', 'Postulate', 'Usá el botón de la oferta para enviar tu postulación.']
                                        ].map(([numero, titulo, descripcion]) => (
                                            <div key={numero} className="tw-flex tw-items-start tw-gap-3">
                                                <span className="tw-flex tw-h-8 tw-w-8 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-emerald-100 tw-text-sm tw-font-bold tw-text-emerald-800">{numero}</span>
                                                <div>
                                                    <p className="tw-m-0 tw-text-sm tw-font-bold tw-text-slate-800">{titulo}</p>
                                                    <p className="tw-m-0 tw-mt-0.5 tw-text-sm tw-leading-5 tw-text-slate-500">{descripcion}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <section className="tw-rounded-3xl tw-border tw-border-blue-100 tw-bg-gradient-to-br tw-from-blue-50 tw-to-indigo-50 tw-p-5">
                                    <div className="tw-flex tw-items-start tw-gap-3">
                                        <i className="bi bi-person-vcard-fill tw-mt-0.5 tw-text-xl tw-text-blue-700" aria-hidden="true" />
                                        <div>
                                            <h3 className="tw-m-0 tw-text-sm tw-font-bold tw-text-slate-900">Dejá tu perfil listo</h3>
                                            <p className="tw-mb-3 tw-mt-1 tw-text-sm tw-leading-5 tw-text-slate-600">
                                                Completá tus aptitudes y experiencia antes de postularte.
                                            </p>
                                            <button
                                                type="button"
                                                className="tw-rounded-lg tw-bg-blue-700 tw-px-3.5 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-blue-800"
                                                onClick={() => navigate('/cv')}
                                            >
                                                Ir a mi perfil <i className="bi bi-arrow-right tw-ml-1" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </aside>
                </div>
            </main>

            {toast && (
                <div className="tw-fixed tw-bottom-6 tw-left-1/2 tw-z-[9999] tw-flex tw-max-w-[calc(100%-2rem)] tw--translate-x-1/2 tw-items-center tw-gap-2 tw-rounded-xl tw-bg-emerald-800 tw-px-5 tw-py-3 tw-font-semibold tw-text-white tw-shadow-xl" role="status">
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    {toast}
                </div>
            )}
        </div>
    );
}