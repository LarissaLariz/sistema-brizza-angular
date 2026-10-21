const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (getApps().length === 0) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

async function authCliente(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Autenticação necessária.' });
  }

  try {
    const decodificado = await getAuth().verifyIdToken(token);

    req.cliente = { email: decodificado.email, uid: decodificado.uid };

    next();
  } catch (erro) {
    console.error(erro);
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = authCliente;