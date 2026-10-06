import { body } from 'express-validator';

const autenticacionValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Ingresa un correo electrónico válido')
        .normalizeEmail(),
    body('password')
        .isString().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const registroValidation = [
    body('nombre_apellido').trim().notEmpty().withMessage('El nombre y apellido es obligatorio'),
    body('domicilio').trim().notEmpty().withMessage('El domicilio es obligatorio'),
    body('edad').isInt({ min: 13, max: 120 }).withMessage('La edad debe estar entre 13 y 120 años'),
    body('sexo').trim().notEmpty().withMessage('El sexo es obligatorio'),
    body('fecha_nacimiento').isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
    body('rol').optional().isIn(['empleado', 'empleador']).withMessage('El rol no es válido'),
    ...autenticacionValidation
];

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
        .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),

    body('aptitudes')
        .optional()
        .isString().withMessage('Las aptitudes deben ser texto')
        .trim()
        .notEmpty().withMessage('Las aptitudes son obligatorias'),

    body('experiencias')
        .optional()
        .isString().withMessage('Las experiencias deben ser texto')
        .trim()
        .notEmpty().withMessage('Las experiencias son obligatorias')
];

export { autenticacionValidation, registroValidation, crearPerfilValidation, editarPerfilValidation };