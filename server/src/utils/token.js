import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


const TOKEN_BYTES = 48; // 48 bytes -> hex largo y seguro

// Token para Recuperacion de Contraseña
export const generateResetToken = () => {
    return crypto.randomBytes(TOKEN_BYTES).toString('hex'); // token crudo para enviar por email
}

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
};

export const generateRefreshToken = () => {
    return uuidv4(); // Genera un UUID como Refresh Token
};


export const hashTokenToBuffer = (tokenPlain) => {
    // SHA-256 binario (32 bytes)
    return crypto.createHash('sha256').update(tokenPlain, 'utf8').digest();
}


export function generateRefreshTokenPair(payload) {
    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashTokenToBuffer(refreshToken); // BINARY(32) HASHED TOKEN

    const expiresAt = new Date(Date.now() + parseDuration(process.env.JWT_REFRESH_EXPIRES_IN));
    const sessionStart = new Date();

    return { accessToken, refreshToken, refreshTokenHash, expiresAt, sessionStart };
}

/**
 * Helper function to parse duration strings like '15m', '7d' into milliseconds.
 */
export function parseDuration(durationStr) {
    const regex = /^(\d+)([smhd])$/;
    const match = durationStr.match(regex);
    if (!match) throw new Error(`Invalid duration format: ${durationStr}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Unknown duration unit: ${unit}`);
    }
}
