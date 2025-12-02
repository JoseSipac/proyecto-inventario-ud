// src/controllers/productos.controller.js
const { getConnection, sql } = require('../db');

// Obtener todos los productos
async function getProductos(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id, codigo, nombre, categoria, proveedor,
             stock_actual, stock_minimo, creado_en, actualizado_en
      FROM productos
      ORDER BY nombre;
    `);

    res.json({
      ok: true,
      total: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener productos',
      error: error.message
    });
  }
}

// Crear un nuevo producto
async function createProducto(req, res) {
  try {
    const { codigo, nombre, categoria, proveedor, stock_minimo } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos codigo y nombre son obligatorios'
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('codigo', sql.VarChar(50), codigo)
      .input('nombre', sql.VarChar(150), nombre)
      .input('categoria', sql.VarChar(100), categoria || null)
      .input('proveedor', sql.VarChar(150), proveedor || null)
      .input('stock_minimo', sql.Int, stock_minimo || 0)
      .query(`
        INSERT INTO productos (codigo, nombre, categoria, proveedor, stock_actual, stock_minimo)
        VALUES (@codigo, @nombre, @categoria, @proveedor, 0, @stock_minimo);

        SELECT SCOPE_IDENTITY() AS id;
      `);

    const nuevoId = result.recordset[0].id;

    res.status(201).json({
      ok: true,
      mensaje: 'Producto creado correctamente',
      id: nuevoId
    });

  } catch (error) {
    console.error('Error en createProducto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear producto',
      error: error.message
    });
  }
}

module.exports = {
  getProductos,
  createProducto
};
