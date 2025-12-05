import aj from '#configs/arcjet.js';
import logger from '#configs/logger.js';
import { slidingWindow } from '@arcjet/node';

async function securityMiddleware(req, res, next) {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded (20 per minute)';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded (10 per minute)';
        break;
      default:
        limit = 5;
        message = 'Guest request limit exceeded (5 per minute)';
    }

    const client = aj.withRule(slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: limit,
      name: `${role}_rate_limit`,
    }));

    const decision = await client.protect(req);

    // if (decision.isDenied() && decision.reason.isBot()) {
    //   logger.warn('Bot detected, request blocked', {
    //     ip: req.ip,
    //     userAgent: req.get('User-Agent'),
    //     path: req.path,
    //   });

    //   return res.status(403).json({ error: 'Bot detected', message: 'Your request has been blocked due to bot detection' });
    // }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({ error: 'Shield blocked request', message: 'Your request has been blocked due to security policy' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded, request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({ error: 'Rate limit exceeded', message });
    }

    next();
  }
  catch (error) {
    logger.error('Security middleware error', error);
    return res.status(500).json({ error: 'Internal server error', message: 'Something went wrong in security middleware' });
  }
}

export default securityMiddleware;
