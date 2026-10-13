import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

export const PerfilesService = {
    registrar: (datos)    => api.post('/perfiles/registro', datos),
    login:    (datos)     => api.post('/perfiles/login', datos),
    listar:  ()           => api.get('/perfiles'),
    obtener: (id)         => api.get(`/perfiles/${id}`),
    crear:   (datos)      => api.post('/perfiles', datos),
    editar:  (id, datos)  => api.put(`/perfiles/${id}`, datos)
};

export const OfertasService = {
    listar:       (modalidad, empleadorId) => api.get('/ofertas', {
        params: {
            ...(modalidad && { modalidad }),
            ...(empleadorId && { empleador_id: empleadorId })
        }
    }),
    obtener:      (id)        => api.get(`/ofertas/${id}`),
    postulantes:  (id)        => api.get(`/ofertas/${id}/postulantes`),
    crear:        (datos)     => api.post('/ofertas', datos),
    eliminar:     (id, empleadorId) => api.delete(`/ofertas/${id}`, { params: { empleador_id: empleadorId } })
};

export const PostulacionesService = {
    porPerfil:     (perfilId)        => api.get('/postulaciones', { params: { perfil_id: perfilId } }),
    crear:         (perfil_id, oferta_id) => api.post('/postulaciones', { perfil_id, oferta_id }),
    cambiarEstado: (id, estado)      => api.put(`/postulaciones/${id}`, { estado }),
    eliminar:      (id, perfilId)    => api.delete(`/postulaciones/${id}`, { params: { perfil_id: perfilId } })
};