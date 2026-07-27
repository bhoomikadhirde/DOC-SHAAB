import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/env';
import routes from './routes';
import { auditMiddleware } from './middleware/audit.middleware';

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve uploaded reports statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Audit Logging Middleware
app.use(auditMiddleware);

// API Routes
app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), app: 'DOC Shaab' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`DOC Shaab Backend API running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
