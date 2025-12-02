// src/controllers/auth.controller.js
const { getConnection, sql } = require('../db');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { correo, password } = req.body;

  try {
    if (!correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe enviar correo y password'
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('correo', sql.VarChar(150), correo)
      .query(`
        SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol_id, u.activo,
               r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE u.correo = @correo;
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    const user = result.recordset[0];

    // Por ahora comparamos contraseña en texto plano
    if (user.password_hash !== password) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        ok: false,
        mensaje: 'El usuario está inactivo'
      });
    }

    // Crear token JWT sencillo
    const payload = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secreto-super-simple',
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      mensaje: 'Login exitoso',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error en el proceso de login',
      error: error.message
    });
  }
}

module.exports = {
  login
};
