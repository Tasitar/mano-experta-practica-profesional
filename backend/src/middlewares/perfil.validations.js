import { body } from 'express-validator';

const crearPerfilValidation = [
    body('nombre_apellido')
        .trim()
        .notEmpty().withMessage('El nombre y apellido es obligatorio')
        .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),

    body('fecha_nacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),

    body('domicilio')
        .trim()
        .notEmpty().withMessage('El domicilio es obligatorio')
        .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),

    body('aptitudes')
        .trim()
        .notEmpty().withMessage('Las aptitudes son obligatorias'),

    body('experiencias')
        .trim()
        .notEmpty().withMessage('Las experiencias son obligatorias')
];

const editarPerfilValidation = [
    body('nombre_apellido')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),

    body('fecha_nacimiento')
        .optional()
        .isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),

    body('domicilio')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Máximo 255 caracteres')
];

export { crearPerfilValidation, editarPerfilValidation };