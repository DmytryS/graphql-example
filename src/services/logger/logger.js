import fs from 'fs';
import path from 'path';
import log4js from 'log4js';
import configuration from '../../../config';

export class Logger {
  constructor(config) {
    this.config = config;
  }

  configureLogs() {
    const pathToFile = path.join(__dirname, '../../../', this.config.LOGGER.path);

    if (!fs.existsSync(pathToFile)) {
      fs.mkdirSync(pathToFile);
    }
    const appenders = {
      file: {
        type: 'file',
        filename: path.join(pathToFile, this.config.LOGGER.filename),
        timezoneOffset: 0
      }
    };
    const categories = {
      default: { appenders: ['file'], level: 'error' }
    };

    if (process.env.NODE_ENV !== 'production') {
      appenders.console = { type: 'console' };
      categories.default.appenders.push('console');
      categories.default.level = 'info';
    }

    log4js.configure({ categories, appenders });
  }
}

export default new Logger(configuration);
