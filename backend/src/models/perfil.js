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
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true,
        validate: { isEmail: true }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    edad: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sexo: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    rol: {
        type: DataTypes.ENUM('empleado', 'empleador'),
        allowNull: false,
        defaultValue: 'empleado'
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    domicilio: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
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