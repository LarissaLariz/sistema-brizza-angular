
const jwt = require('jsonwebtoken');

function authAdmin(req, res, next) {
  const segredoJwt = process.env.JWT_SECRET;
  const autorizacao = req.headers.authorization;

  if (!segredoJwt) {
    return res.status(500).json({
      erro: 'Autenticação não configurada no servidor.',
    });
  }

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Autenticação necessária.',
    });
  }

  const token = autorizacao.slice(7);

  try {
    const usuario = jwt.verify(token, segredoJwt);

    if (usuario.tipo !== 'admin') {
      return res.status(403).json({
        erro: 'Acesso restrito ao administrador.',
      });
    }

    req.admin = usuario;
    next();
  } catch {
    return res.status(401).json({
      erro: 'Token inválido ou expirado. Entre novamente.',
    });
  }
}

module.exports = authAdmin;
