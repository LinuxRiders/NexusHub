import crypto from 'crypto';
import logger from '../../../utils/logger.js'; // Assuming logger is needed or was used implicitly? No, used in line 46.

/**
 * Token Authentication Logic (Compatible with Bunny.net algorithm)
 */
export const UrlSigner = {

    /**
     * Generates a signed token for a URL path.
     * @param {string} path - The path to sign (e.g., "/video.mp4" or "/directory/")
     * @param {string} securityKey - The secret key
     * @param {number} expirationTime - Unix timestamp when token expires
     * @param {string} userIp - Optional IP restriction
     * @param {boolean} isDirectory - If true, path must end with /
     * @returns {string} The token string
     */
    generateToken: (path, securityKey, expirationTime, userIp = '', isDirectory = false) => {
        // Algorithm: SecurityKey + Path + Expires + (UserIP if used)
        const parameterData = isDirectory ? `token_path=${path}` : ''; 
        
        let stringToSign = securityKey + path + expirationTime;
        if (userIp) stringToSign += userIp;
        if (parameterData) stringToSign += parameterData; 
        
        const token = crypto.createHash('sha256')
            .update(stringToSign)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return token;
    },

    /**
     * Validates a token.
     * @param {string} token - The token from URL
     * @param {string} path - The path accessed
     * @param {string} securityKey - The secret key
     * @param {number} expirationTime - The expiration timestamp from URL
     * @returns {boolean}
     */
    validateToken: (token, path, securityKey, expirationTime) => {
        if (!token || !expirationTime) return false;
        
        const now = Math.floor(Date.now() / 1000);
        if (now > parseInt(expirationTime)) {
            logger.warn('[UrlSigner] Token expired');
            return false;
        }

        // Re-generate to compare
        const expectedToken = UrlSigner.generateToken(path, securityKey, expirationTime);
        
        if (token === expectedToken) return true;
        
        return false;
    }
};

/**
 * Helper to construct the full signed URL.
 * @param {string} host - Domain
 * @param {string} path - File path
 * @param {string} securityKey
 * @param {number} expiresInSeconds
 */
export const signUrl = (host, path, securityKey, expiresInSeconds = 3600) => {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = UrlSigner.generateToken(path, securityKey, expires);
    
    // Construct URL
    // Bunny style: https://host/path?token=...&expires=...
    const separator = path.includes('?') ? '&' : '?';
    return `${host}${path}${separator}token=${token}&expires=${expires}`;
};
