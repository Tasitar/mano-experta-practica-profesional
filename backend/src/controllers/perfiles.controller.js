import { Perfil } from '../models/index.js';

const listar = async (req, res) => {
    try {
        const perfiles = await Perfil.findAll({ order: [['created_at', 'DESC']] });
        res.json(perfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtener = async (req, res) => {
    try {
        const perfil = await Perfil.findByPk(req.params.id);
        if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
        res.json(perfil);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { nombre_apellido, fecha_nacimiento, domicilio, aptitudes, experiencias } = req.body;
        const perfil = await Perfil.create({ nombre_apellido, fecha_nacimiento, domicilio, aptitudes, experiencias });
        res.status(201).json(perfil);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editar = async (req, res) => {
    try {
        const perfil = await Perfil.findByPk(req.params.id);
        if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
        await perfil.update(req.body);
        res.json(perfil);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const perfil = await Perfil.findByPk(req.params.id);
        if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
        await perfil.destroy();
        res.json({ mensaje: 'Perfil eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { listar, obtener, crear, editar, eliminar };