// services/baseGoogleService.js
import logger from "../../../utils/logger.js";
import GoogleAuthService, { AuthRequiredError } from "./GoogleAuth.service.js";

/**
 * BaseGoogleService
 * - authService es inyectable para testabilidad (por defecto usa singleton).
 * - executeOperation(operationFn, opts)
 *     -> devuelve { ok:true, data }
 *     -> o { ok:false, authUrl, state } si falta auth y waitForAuth=false
 *     -> o { ok:false, queued:true, authUrl, state } si falta auth y waitForAuth=true && enqueueAndReturnAuthUrl=true
 *     -> o { ok:false, error } en otros errores
 */
export default class BaseGoogleService {
  constructor(userId, authService = GoogleAuthService) {

    this.userId = userId;
    this.authService = authService;
  }

  // Subclases sobreescriben para todos los scopes de sus metodos
  getServiceScopes() {
    return [];
  }

  async init() {
    try {
      await this.authService.initialize(this.userId, this.getServiceScopes());

    } catch (err) {
      if (err instanceof AuthRequiredError) {
        // Devolvemos authUrl para que frontend lo redireccione
        return { ok: false, authUrl: err.authUrl, state: err.state };
      }

      // Otros errores
      throw err;
    }
  }

  /**
   * operationFn: async (authClient) => T
   * opts:
   *  - auth (optional): OAuth2 client (ya inicializado). Si está presente, se ejecuta la operación sin flow de auth.
   *  - userId (required)
   *  - scopes (array | null) - si null usa getServiceScopes()
   *  - waitForAuth (bool) - si true intentamos encolar/esperar al auth en lugar de devolver authUrl. Default: false.
   *  - enqueueAndReturnAuthUrl (bool) - cuando waitForAuth=true, si true encolamos pero devolvemos inmediatamente authUrl (útil para workers/background).
   *  - timeoutMs (number) - timeout para enqueueOpForUser
   */
  async executeOperation(operationFn, {
    scopes = null,
  } = {}) {

    // const _scopes = Array.isArray(scopes) ? scopes : this.getServiceScopes();

    if (!this.userId) {
      const msg = "BaseGoogleService.executeOperation: missing userId";
      logger.error(msg);
      return { ok: false, error: msg };
    }

    try {
      // Intentamos inicializar (puede devolver AuthRequiredError si no hay refresh válido)
      const authClient = await this.authService.initialize(this.userId, scopes);
      const data = await operationFn(authClient);
      return { ok: true, data };
    } catch (err) {

      throw err;
    }
  }
}
