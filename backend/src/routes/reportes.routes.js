// src/routes/reportes.routes.js
const express = require('express');
const router = express.Router();
const {
  getStockPorCategoria,
  getProductosMasVendidos,
  getSugerenciasReabastecimiento
} = require('../controllers/reportes.controller');

// GET /api/reportes/stock-categoria
router.get('/stock-categoria', getStockPorCategoria);

// GET /api/reportes/productos-mas-vendidos
router.get('/productos-mas-vendidos', getProductosMasVendidos);

router.get('/sugerencias-reabastecimiento', getSugerenciasReabastecimiento);

module.exports = router;
