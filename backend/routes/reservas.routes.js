const express = require('express');
const router = express.Router();

const {
  listarReservas,
  criarReserva,
} = require('../controllers/reservas.controller');

router.get('/', listarReservas);

router.post('/', criarReserva);

module.exports = router;