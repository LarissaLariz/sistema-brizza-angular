
const express = require('express');
const router = express.Router();

const authAdmin = require('../middleware/auth-admin');

const {
  listarImoveis,
  buscarImovelPorId,
  criarImovel,
  atualizarImovel,
  removerImovel,
} = require('../controllers/imoveis.controller');

// Consultas públicas
router.get('/', listarImoveis);
router.get('/:id', buscarImovelPorId);

// Operações restritas ao administrador
router.post('/', authAdmin, criarImovel);
router.put('/:id', authAdmin, atualizarImovel);
router.delete('/:id', authAdmin, removerImovel);

module.exports = router;
