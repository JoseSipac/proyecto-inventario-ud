// src/controllers/movimientos.controller.js
const { getConnection, sql } = require('../db');

// Obtener lista de movimientos (últimos 50)
async function getMovimientos(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT TOP 50 m.id, m.producto_id, p.codigo AS codigo_producto, p.nombre AS nombre_producto,
             m.tipo, m.cantidad, m.fecha, m.usuario_id, u.nombre AS nombre_usuario,
             m.observaciones
      FROM movimientos m
      INNER JOIN productos p ON m.producto_id = p.id
      INNER JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.fecha DESC, m.id DESC;
    `);

    res.json({
      ok: true,
      total: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error en getMovimientos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener movimientos',
      error: error.message
    });
  }
}

// Crear un nuevo movimiento y actualizar stock
async function createMovimiento(req, res) {
  const { producto_id, tipo, cantidad, usuario_id, observaciones } = req.body;

  try {
    if (!producto_id || !tipo || !cantidad || !usuario_id) {
      return res.status(400).json({
        ok: false,
        mensaje: 'producto_id, tipo, cantidad y usuario_id son obligatorios'
      });
    }

    if (cantidad <= 0 && tipo !== 'AJUSTE') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cantidad debe ser mayor que 0 (excepto en AJUSTE)'
      });
    }

    const tipoUpper = String(tipo).toUpperCase();

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    const request = new sql.Request(transaction);

    // 1) Obtener stock actual del producto
    request.input('producto_id', sql.Int, producto_id);

    const productoResult = await request.query(`
      SELECT stock_actual
      FROM productos
      WHERE id = @producto_id;
    `);

    if (productoResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado'
      });
    }

    const stockActual = productoResult.recordset[0].stock_actual;

    // 2) Calcular delta de stock dependiendo del tipo
    let delta = 0;

    if (tipoUpper === 'ENTRADA' || tipoUpper === 'DEVOLUCION') {
      delta = cantidad;
    } else if (tipoUpper === 'SALIDA') {
      delta = -cantidad;
    } else if (tipoUpper === 'AJUSTE') {
      // En ajuste permitimos que cantidad sea positiva o negativa (ya viene así)
      delta = cantidad;
    } else {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        mensaje: 'Tipo de movimiento no válido. Use ENTRADA, SALIDA, DEVOLUCION o AJUSTE'
      });
    }

    const nuevoStock = stockActual + delta;

    if (nuevoStock < 0) {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento dejaría el stock en negativo'
      });
    }

    // 3) Insertar movimiento
    const requestMovimiento = new sql.Request(transaction);
    requestMovimiento
      .input('producto_id', sql.Int, producto_id)
      .input('tipo', sql.VarChar(20), tipoUpper)
      .input('cantidad', sql.Int, cantidad)
      .input('usuario_id', sql.Int, usuario_id)
      .input('observaciones', sql.VarChar(255), observaciones || null);

    const resultadoInsert = await requestMovimiento.query(`
      INSERT INTO movimientos (producto_id, tipo, cantidad, usuario_id, observaciones)
      VALUES (@producto_id, @tipo, @cantidad, @usuario_id, @observaciones);

      SELECT SCOPE_IDENTITY() AS id;
    `);

    const nuevoMovimientoId = resultadoInsert.recordset[0].id;

    // 4) Actualizar stock del producto
    const requestUpdate = new sql.Request(transaction);
    requestUpdate
      .input('nuevoStock', sql.Int, nuevoStock)
      .input('producto_id', sql.Int, producto_id);

    await requestUpdate.query(`
      UPDATE productos
      SET stock_actual = @nuevoStock,
          actualizado_en = GETDATE()
      WHERE id = @producto_id;
    `);

    // 5) Confirmar transacción
    await transaction.commit();

    res.status(201).json({
      ok: true,
      mensaje: 'Movimiento registrado correctamente',
      movimiento_id: nuevoMovimientoId,
      stock_anterior: stockActual,
      stock_nuevo: nuevoStock
    });

  } catch (error) {
    console.error('Error en createMovimiento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar movimiento',
      error: error.message
    });
  }
}

module.exports = {
  getMovimientos,
  createMovimiento
};
