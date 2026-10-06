import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMapEvents } from 'react-leaflet';
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

export default function MapaPage() {
    const { rol, perfilId } = useSesion();
    const navigate   = useNavigate();
    const esEmpleador = rol === 'empleador';
    const esEmpleado  = rol === 'empleado';

    const [ofertas, setOfertas]             = useState([]);
    const [coordSeleccionada, setCoord]     = useState(null);
    const [form, setForm]                   = useState({ puesto: '', empresa: '', modalidad: 'Presencial', descripcion: '' });
    const [toast, setToast]                 = useState('');

    useEffect(() => {
        OfertasService.listar()
            .then(r => setOfertas(r.data))
            .catch(console.error);
    }, []);

    const handleMapClick = (latlng) => {
        setCoord(latlng);
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
        <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>

            {/* Navbar */}
            <nav className="navbar navbar-dark bg-dark mb-4">
                <div className="container">
                    <span className="navbar-brand mb-0 h1">Tablón de Empleo · Mapa</span>
                    <div>
                        <SelectorModo />
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <h1 className="text-center mb-4">Publicación de Oferta Laboral por Zona</h1>

                <div className="row g-4">

                    {/* MAPA */}
                    <div className="col-lg-7">
                        <div className="card">
                            <div className="card-header bg-primary text-white">Mapa de Formosa</div>
                            <div className="card-body p-2">
                                <MapContainer
                                    center={[-26.1849, -58.1731]}
                                    zoom={13}
                                    style={{ height: '480px', width: '100%', cursor: esEmpleador ? 'crosshair' : 'default' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />

                                    <ClickHandler onMapClick={handleMapClick} activo={esEmpleador} />

                                    {/* Marcador temporal del click */}
                                    {coordSeleccionada && (
                                        <CircleMarker
                                            center={[coordSeleccionada.lat, coordSeleccionada.lng]}
                                            radius={8}
                                            pathOptions={{ color: '#6c757d', fillColor: '#adb5bd', fillOpacity: 0.8 }}
                                        >
                                            <Popup>📍 Ubicación seleccionada</Popup>
                                        </CircleMarker>
                                    )}

                                    {/* Ofertas publicadas */}
                                    {ofertas.map(o => {
                                        const color = COLORES[o.modalidad] ?? '#6c757d';
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
                                                        <div style={{ minWidth: 180 }}>
                                                            <h6 style={{ color: '#198754' }}>{o.puesto}</h6>
                                                            <p style={{ fontSize: '0.82rem', margin: '2px 0' }}>🏢 {o.empresa}</p>
                                                            <p style={{ fontSize: '0.82rem', margin: '2px 0' }}>📋 {o.descripcion}</p>
                                                            <span className="badge" style={{ background: color }}>{o.modalidad}</span>
                                                            {esEmpleado && (
                                                                <button
                                                                    className="btn btn-success btn-sm w-100 mt-2"
                                                                    onClick={() => aplicar(o.id)}
                                                                >
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
                        </div>
                    </div>

                    {/* PANEL DERECHO */}
                    <div className="col-lg-5">
                        {esEmpleador && (
                            <div className="card">
                                <div className="card-header bg-success text-white">Nueva Oferta Laboral</div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Puesto</label>
                                            <input className="form-control" value={form.puesto}
                                                onChange={e => setForm({ ...form, puesto: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Empresa</label>
                                            <input className="form-control" value={form.empresa}
                                                onChange={e => setForm({ ...form, empresa: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Modalidad</label>
                                            <select className="form-select" value={form.modalidad}
                                                onChange={e => setForm({ ...form, modalidad: e.target.value })}>
                                                <option>Presencial</option>
                                                <option>Remoto</option>
                                                <option>Híbrido</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Descripción</label>
                                            <textarea className="form-control" rows={4} value={form.descripcion}
                                                onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Ubicación seleccionada</label>
                                            <input className="form-control" readOnly
                                                style={coordSeleccionada ? { borderColor: '#198754', background: '#f0fff4', color: '#198754' } : {}}
                                                value={coordSeleccionada
                                                    ? `Lat: ${coordSeleccionada.lat.toFixed(5)}, Lng: ${coordSeleccionada.lng.toFixed(5)}`
                                                    : 'Seleccioná un punto en el mapa'} />
                                        </div>
                                        <button type="submit" className="btn btn-success w-100">Publicar Oferta</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {esEmpleado && (
                            <div className="card">
                                <div className="card-body">
                                    <h5>¿Cómo postularte?</h5>
                                    <p className="text-muted">
                                        Hacé click en cualquier marcador del mapa y tocá <strong>"Aplicar a este empleo"</strong>.
                                    </p>
                                    <p className="text-muted mb-0">Asegurate de haber cargado tu perfil antes de aplicar.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: '#198754', color: '#fff', padding: '10px 20px',
                    borderRadius: 6, fontSize: '0.9rem', zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}