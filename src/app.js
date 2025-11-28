import logger from '#configs/logger.js';
import securityMiddleware from '#middlewares/security.middleware.js';
import authRoutes from '#routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(securityMiddleware);

app.get('/', (_req, res) => {
  logger.info('Hehehe Haw');
  res.send('Hello World!');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'acquisitions-api is running' });
});

app.use('/api/auth', authRoutes);

export default app;
