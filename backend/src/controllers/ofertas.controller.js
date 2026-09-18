import { Oferta, Postulacion, Perfil } from '../models/index.js';

const listar = async (req, res) => {
    try {
        const { modalidad } = req.query;
        const where = modalidad ? { modalidad } : {};
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
            include: [{ model: Perfil }],
            order: [['created_at', 'DESC']]
        });
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { puesto, empresa, modalidad, descripcion, latitud, longitud } = req.body;
        const oferta = await Oferta.create({ puesto, empresa, modalidad, descripcion, latitud, longitud });
        res.status(201).json(oferta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const oferta = await Oferta.findByPk(req.params.id);
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });
        await oferta.destroy();
        res.json({ mensaje: 'Oferta eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { listar, obtener, postulantes, crear, eliminar };