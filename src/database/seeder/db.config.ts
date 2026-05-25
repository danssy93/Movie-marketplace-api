import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT) || 3306,

  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// test connection on startup
connection
  .getConnection()
  .then((conn) => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

export default connection;
