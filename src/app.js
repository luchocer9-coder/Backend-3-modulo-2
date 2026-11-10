import express from 'express';
import productsRouter from './routes/products.router.js';
import { errorHandler } from './middlewares/error.middleware.js';
import usersRouter from './routes/users.router.js';
import mocksRouter from './routes/mocks.router.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/products', productsRouter);

app.use('/api/users', usersRouter);

app.use('/api/mocks', mocksRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;