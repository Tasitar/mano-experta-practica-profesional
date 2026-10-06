import { Postulacion, Perfil, Oferta } from '../models/index.js';

const listar = async (req, res) => {
    try {
        const { perfil_id, oferta_id } = req.query;
        const where = {};
        if (perfil_id) where.perfil_id = perfil_id;
        if (oferta_id) where.oferta_id = oferta_id;

        const postulaciones = await Postulacion.findAll({
            where,
            include: [
                { model: Perfil, attributes: { exclude: ['password_hash'] } },
                { model: Oferta }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(postulaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { perfil_id, oferta_id } = req.body;

        const existente = await Postulacion.findOne({ where: { perfil_id, oferta_id } });
        if (existente) {
            return res.status(409).json({ error: 'Ya te postulaste a esta oferta' });
        }

        const nueva = await Postulacion.create({ perfil_id, oferta_id });
        res.status(201).json(nueva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cambiarEstado = async (req, res) => {
    try {
        const postulacion = await Postulacion.findByPk(req.params.id);
        if (!postulacion) return res.status(404).json({ error: 'Postulación no encontrada' });

        await postulacion.update({ estado: req.body.estado });
        res.json(postulacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const { perfil_id } = req.query;
        if (!perfil_id) return res.status(400).json({ error: 'El perfil es obligatorio para eliminar la postulación' });

        const postulacion = await Postulacion.findOne({
            where: { id: req.params.id, perfil_id }
        });
        if (!postulacion) return res.status(404).json({ error: 'Postulación no encontrada para este perfil' });

        await postulacion.destroy();
        res.json({ mensaje: 'Postulación eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { listar, crear, cambiarEstado, eliminar };