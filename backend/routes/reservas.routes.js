const express = require('express');
const router = express.Router();

const {
  listarReservas,
} = require('../controllers/reservas.controller');

router.get('/', listarReservas);

module.exports = router;