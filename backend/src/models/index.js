import sequelize from '../config/database.js';

import Perfil from './perfil.js';
import Oferta from './ofertas.js';
import Postulacion from './postulacion.js';

Perfil.hasMany(Postulacion,      { foreignKey: 'perfil_id', onDelete: 'CASCADE' });
Postulacion.belongsTo(Perfil,    { foreignKey: 'perfil_id' });

Perfil.hasMany(Oferta,           { foreignKey: 'empleador_id', onDelete: 'SET NULL' });
Oferta.belongsTo(Perfil,         { foreignKey: 'empleador_id' });

Oferta.hasMany(Postulacion,      { foreignKey: 'oferta_id', as: 'Postulaciones', onDelete: 'CASCADE' });
Postulacion.belongsTo(Oferta,    { foreignKey: 'oferta_id', as: 'Oferta', onDelete: 'CASCADE' });

export { sequelize, Perfil, Oferta, Postulacion };