// Token almacenado en memoria (copia temporal para evitar accesos frecuentes al storage)
let accessToken = localStorage.getItem("accessToken") || null;

/**
 * Guardar accessToken en memoria y en localStorage
 * @param {string} token
 */
export const setAccessToken = (token) => {
    accessToken = token;
    localStorage.setItem("accessToken", token);
};

/**
 * Obtener accessToken actual (desde memoria o localStorage si aún no está cargado)
 * @returns {string|null}
 */
export const getAccessToken = () => {
    if (!accessToken) {
        accessToken = localStorage.getItem("accessToken");
    }
    return accessToken;
};

/**
 * Limpiar accessToken de memoria y localStorage
 */
export const clearAccessToken = () => {
    accessToken = null;
    localStorage.removeItem("accessToken");
};
