import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (plainText) => bcrypt.hash(plainText, SALT_ROUNDS);
export const comparePassword = async (plainText, hash) => bcrypt.compare(plainText, hash);