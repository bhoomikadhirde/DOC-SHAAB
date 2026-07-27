import winston from 'winston';
import path from 'path';

const logDirectory = path.join(__dirname, '../../logs');

export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'doc-shaab-audit' },
  transports: [
    new winston.transports.File({ filename: path.join(logDirectory, 'audit.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export function logAuditEvent(action: string, userId: string | null, details: any, result: 'SUCCESS' | 'FAILURE') {
  auditLogger.info({
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    result
  });
}
