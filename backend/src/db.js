// src/db.js
const sql = require('mssql');

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool;

async function getConnection() {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(dbSettings);
    console.log('✅ Conexión a SQL Server exitosa');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a SQL Server:', error);
    throw error;
  }
}

module.exports = {
  sql,
  getConnection
};
