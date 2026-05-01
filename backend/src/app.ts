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


app.set('trust proxy', 1);


app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());


if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


app.use('/api', apiLimiter);


app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TaskSync API', status: 'online' });
});


app.use('/api/v1', routes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
