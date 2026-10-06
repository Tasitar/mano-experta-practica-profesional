import { Oferta, Postulacion, Perfil } from '../models/index.js';

const listar = async (req, res) => {
    try {
        const { modalidad, empleador_id } = req.query;
        const where = {
            ...(modalidad && { modalidad }),
            ...(empleador_id && { empleador_id })
        };
        const ofertas = await Oferta.findAll({ where, order: [['created_at', 'DESC']] });
        res.json(ofertas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtener = async (req, res) => {
    try {
        const oferta = await Oferta.findByPk(req.params.id);
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });
        res.json(oferta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const postulantes = async (req, res) => {
    try {
        const oferta = await Oferta.findByPk(req.params.id);
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });

        const lista = await Postulacion.findAll({
            where: { oferta_id: req.params.id },
            include: [{ model: Perfil, attributes: { exclude: ['password_hash'] } }],
            order: [['created_at', 'DESC']]
        });
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { puesto, empresa, modalidad, descripcion, latitud, longitud, empleador_id } = req.body;
        const empleador = await Perfil.findByPk(empleador_id);
        if (!empleador) return res.status(404).json({ error: 'Perfil de empleador no encontrado' });

        const oferta = await Oferta.create({
            puesto, empresa, modalidad, descripcion, latitud, longitud, empleador_id
        });
        res.status(201).json(oferta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const { empleador_id } = req.query;
        if (!empleador_id) return res.status(400).json({ error: 'El perfil del empleador es obligatorio para eliminar la oferta' });

        const oferta = await Oferta.findOne({
            where: { id: req.params.id, empleador_id }
        });
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada para este empleador' });
        await oferta.destroy();
        res.json({ mensaje: 'Oferta eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { listar, obtener, postulantes, crear, eliminar };