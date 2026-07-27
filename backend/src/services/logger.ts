import winston from 'winston';
import path from 'path';

const logDirectory = path.join(__dirname, '../../logs');

const transports: any[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (!process.env.VERCEL) {
  transports.push(new winston.transports.File({ filename: path.join(logDirectory, 'audit.log') }));
}

export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'doc-shaab-audit' },
  transports
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
