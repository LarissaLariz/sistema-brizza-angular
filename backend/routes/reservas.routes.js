const express = require('express');
const router = express.Router();

const {
  listarReservas,
  listarReservasPorImovel,
  criarReserva,
} = require('../controllers/reservas.controller');

router.get('/', listarReservas);

router.get('/imovel/:id', listarReservasPorImovel);

router.post('/', criarReserva);

module.exports = router;