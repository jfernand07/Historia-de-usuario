import { Sequelize } from 'sequelize';
import { config } from '../config';
import { Logger } from '../utils/helpers';

class DatabaseConnection {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(config.database.url, {
      dialect: 'postgres',
      logging: config.nodeEnv === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      Logger.info('Database connection established successfully');
    } catch (error) {
      Logger.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      Logger.info('Database connection closed');
    } catch (error) {
      Logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  async sync(force: boolean = false): Promise<void> {
    try {
      await this.sequelize.sync({ force });
      Logger.info(`Database synced successfully (force: ${force})`);
    } catch (error) {
      Logger.error('Error syncing database:', error);
      throw error;
    }
  }

  getSequelize(): Sequelize {
    return this.sequelize;
  }
}

export const database = new DatabaseConnection();
export default database;
