import { Router } from 'express';
const router = Router();

import * as ctrl from '../controllers/ofertas.controller.js';
import validate from '../middlewares/validations/validation.js';
import { crearOfertaValidation } from '../middlewares/oferta.validations.js';

router.get('/',                ctrl.listar);
router.get('/:id',             ctrl.obtener);
router.get('/:id/postulantes', ctrl.postulantes);
router.post('/',               crearOfertaValidation, validate, ctrl.crear);
router.delete('/:id',          ctrl.eliminar);

export default router;