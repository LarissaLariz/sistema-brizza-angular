const pool = require('../database/connection');

async function listarReservas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT *
      FROM reservas
      ORDER BY criado_em DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao buscar reservas',
    });
  }
}

module.exports = {
  listarReservas,
};