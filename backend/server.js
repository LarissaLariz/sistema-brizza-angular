const reservasRoutes = require('./routes/reservas.routes');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./database/connection'); 

const app = express();

const imoveisRoutes = require('./routes/imoveis.routes');

app.use(cors());
app.use(express.json());
app.use('/imoveis', imoveisRoutes);
app.use('/reservas', reservasRoutes);

app.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      mensagem: 'Banco conectado com sucesso 🚀',
      data: resultado.rows[0]
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Falha ao conectar ao banco'
    });
  }
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});