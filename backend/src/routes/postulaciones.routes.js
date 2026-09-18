import { Router } from 'express';
const router = Router();

import * as ctrl from '../controllers/postulaciones.controller.js';
import validate from '../middlewares/validations/validation.js';
import { crearPostulacionValidation, cambiarEstadoValidation } from '../middlewares/postulacion.validations.js';

router.get('/',      ctrl.listar);
router.post('/',     crearPostulacionValidation, validate, ctrl.crear);
router.put('/:id',   cambiarEstadoValidation, validate, ctrl.cambiarEstado);
router.delete('/:id', ctrl.eliminar);

export default router;