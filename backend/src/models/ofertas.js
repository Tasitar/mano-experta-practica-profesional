import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Oferta = sequelize.define('Oferta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    puesto: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    empresa: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    modalidad: {
        type: DataTypes.ENUM('Presencial', 'Remoto', 'Híbrido'),
        allowNull: false,
        defaultValue: 'Presencial'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    empleador_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },
    longitud: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    }
}, {
    tableName: 'ofertas'
});

export default Oferta;