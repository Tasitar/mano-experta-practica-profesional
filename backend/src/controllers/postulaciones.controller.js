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
                { model: Oferta, as: 'Oferta' }
            ],
            order: [['createdAt', 'DESC']]
        });
        const respuesta = postulaciones.map(postulacion => {
            const datos = postulacion.toJSON();
            return {
                ...datos,
                updated_at: datos.updated_at || datos.updatedAt || postulacion.updatedAt,
                created_at: datos.created_at || datos.createdAt || postulacion.createdAt,
                Oferta: datos.Oferta || null
            };
        });
        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const listarPorEmpleador = async (req, res) => {
    try {
        const { empleador_id } = req.params;
        const ofertas = await Oferta.findAll({
            where: { empleador_id },
            attributes: ['id', 'puesto']
        });

        const resultados = await Promise.all(ofertas.map(async oferta => {
            const postulantes = await Postulacion.findAll({
                where: { oferta_id: oferta.id },
                include: [{ model: Perfil, attributes: { exclude: ['password_hash'] } }],
                order: [['created_at', 'DESC']]
            });

            return postulantes.map(postulacion => ({
                id: `postulacion-${postulacion.id}`,
                postulacion_id: postulacion.id,
                titulo: postulacion.Perfil?.nombre_apellido || 'Nuevo postulante',
                texto: `Se postuló a ${oferta.puesto}`,
                fecha: postulacion.createdAt,
                nueva: true,
                tipo: 'postulacion'
            }));
        }));

        res.json(resultados.flat().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const { perfil_id, oferta_id } = req.body;

        const oferta = await Oferta.findByPk(oferta_id);
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });
        if (Number(oferta.empleador_id) === Number(perfil_id)) {
            return res.status(403).json({ error: 'No podés postularte a una oferta publicada por tu propia cuenta' });
        }

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

        const { estado, nota_rechazo } = req.body;
        await postulacion.update({
            estado,
            nota_rechazo: estado === 'Rechazado' ? (nota_rechazo?.trim() || null) : null
        });
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

export { listar, listarPorEmpleador, crear, cambiarEstado, eliminar };