import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Postulacion = sequelize.define('Postulacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    estado: {
        type: DataTypes.ENUM('Pendiente', 'Visto', 'Contactado', 'Rechazado'),
        allowNull: false,
        defaultValue: 'Pendiente'
    },
    nota_rechazo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'postulaciones',
    indexes: [{ unique: true, fields: ['perfil_id', 'oferta_id'] }]
});

export default Postulacion;