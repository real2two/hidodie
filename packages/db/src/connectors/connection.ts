import env from '@/env';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

export const connection = await mysql.createConnection({
  host: env.DatabaseHost,
  port: env.DatabasePort,
  user: env.DatabaseUser,
  password: env.DatabasePassword,
  database: env.DatabaseName,
  waitForConnections: true,
  supportBigNumbers: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(connection);
