import path from 'path';
import MailService from '../services/mail.service.js';


// Definimos dónde están las plantillas (ajusta según tu estructura de carpetas)
const templateDir = path.resolve(process.cwd(), 'src', 'modules/Users-Auth/templates');

export const mailer = new MailService({
    templateDir: templateDir
});