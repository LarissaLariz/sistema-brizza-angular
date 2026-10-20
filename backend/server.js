
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pool = require('./database/connection');
const imoveisRoutes = require('./routes/imoveis.routes');
const reservasRoutes = require('./routes/reservas.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/auth', authRoutes);
app.use('/imoveis', imoveisRoutes);
app.use('/reservas', reservasRoutes);

app.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      mensagem: 'Banco conectado com sucesso 🚀',
      data: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Falha ao conectar ao banco',
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
