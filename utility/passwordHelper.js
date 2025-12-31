import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SECRET = process.env.PASSWORD_SECRET;
const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  if (!SECRET) {
    throw { status: 500, error: 'Password secret environment not configured'}
  }
  
  const passwordWithSecret = crypto
    .createHmac('sha256', SECRET)
    .update(password)
    .digest('hex');
  
  return await bcrypt.hash(passwordWithSecret, SALT_ROUNDS);
};

export const verifyPassword = async (password, hashedPassword) => {
  if (!SECRET) {
    throw { status: 500, error: 'Password secret environment not configured'}
  }
  
  const passwordWithSecret = crypto
    .createHmac('sha256', SECRET)
    .update(password)
    .digest('hex');
  
  return await bcrypt.compare(passwordWithSecret, hashedPassword);
};