import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'feng224318',
  database: process.env.DB_NAME || 'feng_api_development',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connected to feng_api_development');
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
