import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  synchronize: true,
  extra: {
    connectionLimit: 10,
    acquireTimeout: 10000,
    waitForConnections: true,
  },
};

export const datasource = new DataSource(dataSourceOptions);
