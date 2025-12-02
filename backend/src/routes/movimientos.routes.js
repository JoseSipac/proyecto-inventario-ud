// src/routes/movimientos.routes.js
const express = require('express');
const router = express.Router();
const {
  getMovimientos,
  createMovimiento
} = require('../controllers/movimientos.controller');

// GET /api/movimientos
router.get('/', getMovimientos);

// POST /api/movimientos
router.post('/', createMovimiento);

module.exports = router;
