import { Router } from 'express';
const router = Router();

import * as ctrl from '../controllers/perfiles.controller.js';
import validate from '../middlewares/validations/validation.js';
import { crearPerfilValidation, editarPerfilValidation } from '../middlewares/perfil.validations.js';

router.get('/',     ctrl.listar);
router.get('/:id',  ctrl.obtener);
router.post('/',    crearPerfilValidation, validate, ctrl.crear);
router.put('/:id',  editarPerfilValidation, validate, ctrl.editar);
router.delete('/:id', ctrl.eliminar);

export default router;