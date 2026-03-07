import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reemplaza variables {{variable}} en una plantilla HTML
 * @param {string} template - Contenido HTML
 * @param {object} variables - Variables {nombre: valor}
 * @returns {string}
 */
export function replaceTemplateVariables(template, variables = {}) {
    let result = String(template || '');
    for (const [key, value] of Object.entries(variables || {})) {
        // usamos replace global; asumimos variables sanitzadas por el caller si provienen del usuario
        const regex = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g');
        result = result.replace(regex, String(value ?? ''));
    }
    return result;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * readTemplateFile
 * lee un archivo HTML desde templateDir
 */
export function readTemplateFile(templateDir, templateName) {
    const tdir = templateDir || path.join(__dirname, '../services/templates');
    const templatePath = path.join(tdir, templateName);
    return fs.readFileSync(templatePath, 'utf8');
}

