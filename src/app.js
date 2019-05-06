import log4js from 'log4js';
import cors from 'cors';
import express from 'express';
import database from './services/database';
import passport from './services/passport';
import logger from './services/logger';
import apolloServer from './graphql';

export default class App {
  constructor(config) {
    this.config = config;

    logger.configureLogs();

    this.logger = log4js.getLogger('Main Service');
    this.app = false;
  }

  async start() {
    await database.connect();

    const expressApp = express();

    expressApp.use(cors());
    expressApp.use(express.json());
    expressApp.use(passport.initialize());
    // eslint-disable-next-line
    expressApp.use((err, req, res, next) => {
      this.logger.error('Request error', err);

      const DEFAULT_ERR_MSG = 'An error has occured. Please contact system administrator';

      res.status(err.code || 500).json({
        message: err.message || DEFAULT_ERR_MSG
      });
    });

    apolloServer.applyMiddleware({
      app: expressApp,
      path: '/graphql'
    });

    this.app = expressApp.listen(this.config.SERVER.port, () => {
      this.logger.info(`App listening on port ${this.config.SERVER.port}`);
    });

    process.on('uncaughtException', (err) => {
      this.logger.error('Unhandled exception', err);
    });
    process.on('unhandledRejection', (err) => {
      this.logger.error('Unhandled rejection', err);
    });
    process.on('SIGTERM', async () => {
      this.logger.info('Received SIGTERM, going to shutdown server.');
      await this.stop();
      this.logger.info('Exited... Buy :)');
    });
  }

  async stop() {
    await database.disconnect();
    await this.app.close();

    this.logger.info('Server stopped');
  }

  /**
   * Returns express server
   * @returns {Server} returns express server
   */
  get server() {
    return this.app;
  }

  // eslint-disable-next-line
  async clearDb() {
    await database.clearDb();
  }
}
