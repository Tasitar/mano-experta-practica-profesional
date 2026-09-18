import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Perfil = sequelize.define('Perfil', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_apellido: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    domicilio: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    aptitudes: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    experiencias: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'perfiles'
});

export default Perfil;