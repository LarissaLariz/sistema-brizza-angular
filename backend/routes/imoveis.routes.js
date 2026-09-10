const express = require('express');
const router = express.Router();

const {
  listarImoveis,
  buscarImovelPorId,
  criarImovel,
  atualizarImovel,
  removerImovel,
} = require('../controllers/imoveis.controller');

router.get('/', listarImoveis);

router.get('/:id', buscarImovelPorId);

router.post('/', criarImovel);

router.put('/:id', atualizarImovel);

router.delete('/:id', removerImovel);

module.exports = router;