import express from 'express';
import authRoutes from '#routes/auth';
import { docsMiddleware } from '#routes/docs';
import { errorHandler } from '#middlewares/error-handler';
import userRoutes from '#routes/users';
import cors from 'cors';
import { env } from './environment.ts';



const app = express();
const allowedOrigins = env.ALLOWED_ORIGINS;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/docs', ...docsMiddleware);
// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});
app.use(errorHandler);

export { app };
