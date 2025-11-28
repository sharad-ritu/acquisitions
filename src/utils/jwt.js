import logger from '#configs/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    catch (error) {
      logger.error('Failed to sign token', error);
      throw new Error('Token generation failed');
    }
  },

  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
      logger.error('Failed to verify token', error);
      throw new Error('Token verification failed');
    }
  },
};
