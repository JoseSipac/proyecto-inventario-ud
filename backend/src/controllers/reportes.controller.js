// src/controllers/reportes.controller.js
const { getConnection, sql } = require('../db');


// Stock por categoría
async function getStockPorCategoria(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        ISNULL(categoria, 'SIN CATEGORÍA') AS categoria,
        COUNT(*) AS total_productos,
        SUM(stock_actual) AS total_stock,
        SUM(CASE WHEN stock_minimo > 0 AND stock_actual <= stock_minimo THEN 1 ELSE 0 END) AS productos_criticos
      FROM productos
      GROUP BY categoria;
    `);

    res.json({
      ok: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error en getStockPorCategoria:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener stock por categoría',
      error: error.message
    });
  }
}

// Productos más vendidos (basado en movimientos tipo SALIDA)
async function getProductosMasVendidos(req, res) {
  try {
    const pool = await getConnection();

    // Opcional: podrías leer fecha_desde / fecha_hasta de query params
    const result = await pool.request().query(`
      SELECT TOP 10
        p.id,
        p.codigo,
        p.nombre,
        p.categoria,
        SUM(CASE WHEN m.tipo = 'SALIDA' THEN m.cantidad ELSE 0 END) AS total_vendido
      FROM productos p
      INNER JOIN movimientos m ON m.producto_id = p.id
      WHERE m.tipo = 'SALIDA'
      GROUP BY p.id, p.codigo, p.nombre, p.categoria
      HAVING SUM(CASE WHEN m.tipo = 'SALIDA' THEN m.cantidad ELSE 0 END) > 0
      ORDER BY total_vendido DESC, p.nombre ASC;
    `);

    res.json({
      ok: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error en getProductosMasVendidos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener productos más vendidos',
      error: error.message
    });
  }
}

async function getSugerenciasReabastecimiento(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        p.id,
        p.codigo,
        p.nombre,
        ISNULL(p.categoria, 'SIN CATEGORÍA') AS categoria,
        p.proveedor,
        p.stock_actual,
        p.stock_minimo,
        CASE 
          WHEN p.stock_minimo > 0 AND p.stock_actual <= p.stock_minimo
          THEN (p.stock_minimo * 2) - p.stock_actual
          ELSE 0
        END AS cantidad_sugerida
      FROM productos p
      WHERE p.stock_minimo > 0
        AND p.stock_actual <= p.stock_minimo;
    `);

    res.json({
      ok: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error en getSugerenciasReabastecimiento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener sugerencias de reabastecimiento',
      error: error.message
    });
  }
}

module.exports = {
  getStockPorCategoria,
  getProductosMasVendidos,
  getSugerenciasReabastecimiento
};
