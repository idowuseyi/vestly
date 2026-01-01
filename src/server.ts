import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    VESTLY API SERVER                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(47)} ║
║  Port:        ${config.port.toString().padEnd(47)} ║
║  Auth Mode:   ${config.auth.mode.padEnd(47)} ║
║  API Version: ${config.api.version.padEnd(47)} ║
║                                                               ║
║  Swagger UI:  http://localhost:${config.port}/api-docs${' '.repeat(17)} ║
║  Health:      http://localhost:${config.port}/health${' '.repeat(20)} ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
