const express = require('express');
const router = express.Router();

const authAdmin = require('../middleware/auth-admin');
const authCliente = require('../middleware/auth-cliente');

const {
  listarReservas,
  listarMinhasReservas,
  listarIndisponibilidades,
  listarReservasPorImovel,
  criarReserva,
  atualizarStatusReserva,
} = require('../controllers/reservas.controller');

const {
  listarBloqueios,
  criarBloqueio,
  removerBloqueio,
} = require('../controllers/bloqueios.controller');

router.get('/', authAdmin, listarReservas);
router.get('/minhas', authCliente, listarMinhasReservas);
router.get('/indisponibilidades', listarIndisponibilidades);
router.get('/imovel/:id', listarReservasPorImovel);
router.post('/', criarReserva);
router.patch('/:id/status', authAdmin, atualizarStatusReserva);

router.get('/bloqueios', authAdmin, listarBloqueios);
router.post('/bloqueios', authAdmin, criarBloqueio);
router.delete('/bloqueios/:id', authAdmin, removerBloqueio);

module.exports = router;