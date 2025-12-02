// src/routes/productos.routes.js
const express = require('express');
const router = express.Router();
const {
  getProductos,
  createProducto
} = require('../controllers/productos.controller');

// GET /api/productos
router.get('/', getProductos);

// POST /api/productos
router.post('/', createProducto);

module.exports = router;
