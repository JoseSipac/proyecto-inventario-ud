// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./db');
const movimientosRoutes = require('./routes/movimientos.routes');
const authRoutes = require('./routes/auth.routes');
const reportesRoutes = require('./routes/reportes.routes');

// importar rutas
const productosRoutes = require('./routes/productos.routes');

const app = express();

// Middlewares
app.use(cors());
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

// 🔹 Prefijo para productos: /api/productos
// Rutas de autenticación
app.use('/api/auth', authRoutes);

app.use('/api/reportes', reportesRoutes);

// Productos
app.use('/api/productos', productosRoutes);

// Movimientos
app.use('/api/movimientos', movimientosRoutes);


// Puerto (lee de .env o usa 3000 por defecto)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
