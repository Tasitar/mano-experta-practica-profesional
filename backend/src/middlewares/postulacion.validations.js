import { body } from 'express-validator';

const crearPostulacionValidation = [
    body('perfil_id')
        .notEmpty().withMessage('El perfil_id es obligatorio')
        .isInt({ min: 1 }).withMessage('perfil_id debe ser un número entero positivo'),

    body('oferta_id')
        .notEmpty().withMessage('El oferta_id es obligatorio')
        .isInt({ min: 1 }).withMessage('oferta_id debe ser un número entero positivo')
];

const cambiarEstadoValidation = [
    body('estado')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(['Pendiente', 'Visto', 'Contactado', 'Rechazado'])
        .withMessage('Estado inválido. Opciones: Pendiente, Visto, Contactado, Rechazado')
];

export { crearPostulacionValidation, cambiarEstadoValidation };