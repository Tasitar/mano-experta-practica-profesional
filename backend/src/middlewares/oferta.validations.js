import { body } from 'express-validator';

const crearOfertaValidation = [
    body('puesto')
        .trim()
        .notEmpty().withMessage('El puesto es obligatorio')
        .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),

    body('empresa')
        .trim()
        .notEmpty().withMessage('La empresa es obligatoria')
        .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),

    body('modalidad')
        .notEmpty().withMessage('La modalidad es obligatoria')
        .isIn(['Presencial', 'Remoto', 'Híbrido'])
        .withMessage('Modalidad inválida. Opciones: Presencial, Remoto, Híbrido'),

    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es obligatoria'),

    body('latitud')
        .notEmpty().withMessage('La latitud es obligatoria')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),

    body('longitud')
        .notEmpty().withMessage('La longitud es obligatoria')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
];

export { crearOfertaValidation };