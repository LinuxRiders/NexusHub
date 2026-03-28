import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Guardamos temporalmente antes de procesar
const tempDir = 'uploads/temp/';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Factory para crear middlewares de subida.
 * @param {Object} config - { allowedTypes: ['video/', 'image/'], limitMB: 500 }
 */
const createUploadMiddleware = ({ allowedTypes, limitMB }) => {
    
    const fileFilter = (req, file, cb) => {
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
        
        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error(`Formato no válido. Permitidos: ${allowedTypes.join(', ')}`), false);
        }
    };

    return multer({
        storage: tempStorage,
        fileFilter: fileFilter,
        limits: { fileSize: limitMB * 1024 * 1024 }
    });
};

// Middlewares pre-configurados para uso en rutas
export const uploadVideoMiddleware = createUploadMiddleware({
    allowedTypes: ['video/'],
    limitMB: 500
});

export const uploadStaticMiddleware = createUploadMiddleware({
    allowedTypes: ['image/', 'application/pdf', 'audio/'],
    limitMB: 50
});