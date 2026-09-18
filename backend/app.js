import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sequelize } from './src/models/index.js';

import perfilesRoutes from './src/routes/perfiles.routes.js';
import ofertasRoutes from './src/routes/ofertas.routes.js';
import postulacionesRoutes from './src/routes/postulaciones.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/perfiles', perfilesRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/postulaciones', postulacionesRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API del Tablón de Empleo funcionando' });
});

const PORT = process.env.PORT || 4000;

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log(' Conexión a MySQL establecida correctamente.');

        await sequelize.sync({ alter: true });
        console.log(' Modelos sincronizados con la base de datos.');

        app.listen(PORT, () => {
            console.log(` Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(' Error al conectar:', error.message);
    }
}

iniciar();