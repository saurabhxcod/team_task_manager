import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimiter';
import routes from './routes';

const app = express();

// Trust proxy for Vercel/Cloud deployment
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
