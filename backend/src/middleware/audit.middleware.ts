import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logAuditEvent } from '../services/logger';

export function auditMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api/')) {
      logAuditEvent(
        `${req.method}_${req.originalUrl}`,
        req.user?.user_id || null,
        {
          ip: req.ip,
          statusCode: res.statusCode,
          durationMs: duration
        },
        res.statusCode < 400 ? 'SUCCESS' : 'FAILURE'
      );
    }
  });
  next();
}
