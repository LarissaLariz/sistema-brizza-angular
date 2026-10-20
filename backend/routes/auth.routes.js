
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/admin-login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const emailAdmin = process.env.ADMIN_EMAIL;
    const hashSenha = process.env.ADMIN_PASSWORD_HASH;
    const segredoJwt = process.env.JWT_SECRET;

    if (!emailAdmin || !hashSenha || !segredoJwt) {
      return res.status(500).json({
        erro: 'Configuração de autenticação ausente no servidor.',
      });
    }

    if (
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      email.trim().toLowerCase() !== emailAdmin.trim().toLowerCase()
    ) {
      return res.status(401).json({ erro: 'Login inválido.' });
    }

    const senhaValida = await bcrypt.compare(senha, hashSenha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Login inválido.' });
    }

    const token = jwt.sign(
      { tipo: 'admin', email: emailAdmin },
      segredoJwt,
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      usuario: { email: emailAdmin, tipo: 'admin' },
    });
  } catch (erro) {
    console.error('Erro no login administrativo:', erro);
    return res.status(500).json({ erro: 'Erro interno no login.' });
  }
});

module.exports = router;
