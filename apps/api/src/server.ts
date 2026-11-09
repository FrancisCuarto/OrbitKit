import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './security/config.js';

async function bootstrap() {
  try {
    console.log(`Connecting to MongoDB at: ${config.MONGODB_URI}`);
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Successfully connected to MongoDB database');

    const app = createApp();
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 DevDock REST API server running on port ${config.PORT} [${config.NODE_ENV}]`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('DevDock API closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start DevDock API server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
