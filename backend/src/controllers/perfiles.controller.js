import { Perfil } from '../models/index.js';
import bcrypt from 'bcryptjs';

const datosPublicos = (perfil) => {
    const datos = perfil.toJSON();
    delete datos.password_hash;
    return datos;
};

const registrar = async (req, res) => {
    try {
        const { nombre_apellido, email, password, domicilio, edad, sexo, fecha_nacimiento, rol = 'empleado' } = req.body;
        const existente = await Perfil.findOne({ where: { email: email.toLowerCase() } });
        if (existente) return res.status(409).json({ error: 'El correo electrónico ya está registrado' });

        const perfil = await Perfil.create({
            nombre_apellido,
            email: email.toLowerCase(),
            password_hash: await bcrypt.hash(password, 12),
            domicilio,
            edad,
            sexo,
            fecha_nacimiento,
            rol,
            aptitudes: '',
            experiencias: ''
        });

        res.status(201).json(datosPublicos(perfil));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const perfil = await Perfil.findOne({ where: { email: email.toLowerCase() } });
        if (!perfil || !(await bcrypt.compare(password, perfil.password_hash))) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        res.json(datosPublicos(perfil));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const perfiles = await Perfil.findAll({ order: [['created_at', 'DESC']] });
        res.json(perfiles.map(datosPublicos));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtener = async (req, res) => {
    try {
        const perfil = await Perfil.findByPk(req.params.id);
        if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
        res.json(datosPublicos(perfil));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { nombre_apellido, fecha_nacimiento, domicilio, telefono, aptitudes, experiencias } = req.body;
        const perfil = await Perfil.create({ nombre_apellido, fecha_nacimiento, domicilio, telefono, aptitudes, experiencias });
        res.status(201).json(perfil);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editar = async (req, res) => {
    try {
        const perfil = await Perfil.findByPk(req.params.id);
        if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
        const { nombre_apellido, fecha_nacimiento, domicilio, telefono, aptitudes, experiencias } = req.body;
        await perfil.update({
            ...(nombre_apellido !== undefined && { nombre_apellido }),
            ...(fecha_nacimiento !== undefined && { fecha_nacimiento }),
            ...(domicilio !== undefined && { domicilio }),
            ...(telefono !== undefined && { telefono }),
            ...(aptitudes !== undefined && { aptitudes }),
            ...(experiencias !== undefined && { experiencias })
        });
        res.json(datosPublicos(perfil));
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

export { registrar, login, listar, obtener, crear, editar, eliminar };