import mongoose from 'mongoose';
import log4js from 'log4js';
import configuration from '../../../config';

export class Database {
  /**
   * Initializes mongoose database.
   * @param {Object} config DB configuration
   */
  constructor(config) {
    this.logger = log4js.getLogger('Database');
    this.config = config;
    this.db = {};

    mongoose.connection.on('error', this._onError.bind(this));
    mongoose.connection.once('open', this._onOpen.bind(this));
    mongoose.connection.on('disconnected', this._onDisconnected.bind(this));
    mongoose.connection.on('close', this._onClose.bind(this));
  }

  _onError(err) {
    this.logger.error(`Mongoose connection error: ${err}`);
  }

  _onOpen() {
    this.logger.info(`Succesfully connected to ${process.env.NODE_ENV} database`);
  }

  _onDisconnected() {
    this.logger.info('Disconnected from MongoDB');
  }

  _onClose() {
    this.logger.info('MongoDB connection closed');
  }

  /**
   * Connects to the database
   * @return {Promise} promise to connect to database
   */
  async connect() {
    await mongoose.connect(this.config.DB.url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    this.db = mongoose.connection;
  }

  /**
   * Clears the database
   * @returns {Promise} promise to clear database
   */
  async clearDb() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Will not drop collection until in test env');
    }

    return new Promise((res, rej) => {
      this.db.dropDatabase((err) => {
        this.logger.info('Cleared DB');
        if (err) {
          this.logger.error(err);
          rej(err);
        }
        res();
      });
    });
  }

  /**
   * Disconnects from database
   * @returns {Promise} promise to diconnect from DB
   */
  async disconnect() {
    return this.db.close();
  }
}

export default new Database(configuration);
