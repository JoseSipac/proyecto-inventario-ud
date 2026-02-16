// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./db');

const movimientosRoutes = require('./routes/movimientos.routes');
const authRoutes = require('./routes/auth.routes');
const reportesRoutes = require('./routes/reportes.routes');
const productosRoutes = require('./routes/productos.routes');
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

app.use(cors());

app.use("/webhooks", webhookRoutes);

app.use(express.json());

// Ruta de prueba simple
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Inventario funcionando 🚀' });
});

// Ruta para probar conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT GETDATE() AS fecha_servidor;');
    res.json({
      ok: true,
      mensaje: 'Conexión a SQL Server OK',
      fecha_servidor: result.recordset[0].fecha_servidor
    });
  } catch (error) {
    console.error('Error en /db-test:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al conectar a SQL Server',
      error: error.message
    });
  }
});

// Rutas normales
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/movimientos', movimientosRoutes);

module.exports = app;
