import { app } from './app';

const startServer = async () => {
  try {
    await app.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' });
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();