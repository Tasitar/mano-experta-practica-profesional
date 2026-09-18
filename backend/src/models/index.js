import sequelize from '../config/database.js';

import Perfil from './perfil.js';
import Oferta from './ofertas.js';
import Postulacion from './postulacion.js';

Perfil.hasMany(Postulacion,      { foreignKey: 'perfil_id', onDelete: 'CASCADE' });
Postulacion.belongsTo(Perfil,    { foreignKey: 'perfil_id' });

Oferta.hasMany(Postulacion,      { foreignKey: 'oferta_id', onDelete: 'CASCADE' });
Postulacion.belongsTo(Oferta,    { foreignKey: 'oferta_id' });

export { sequelize, Perfil, Oferta, Postulacion };