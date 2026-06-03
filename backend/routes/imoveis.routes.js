const express = require('express');
const router = express.Router();

const {
  listarImoveis,
  buscarImovelPorId,
} = require('../controllers/imoveis.controller');

router.get('/', listarImoveis);

router.get('/:id', buscarImovelPorId);

module.exports = router;