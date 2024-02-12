import { DataSource } from 'typeorm';
const dbConfig = require('../../../ormconfig');

export const dataSource = new DataSource(dbConfig);
