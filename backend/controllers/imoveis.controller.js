const pool = require('../database/connection');

async function listarImoveis(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT *
      FROM imoveis
      WHERE ativo = true
      ORDER BY id
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao buscar imóveis',
    });
  }
}

async function buscarImovelPorId(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM imoveis WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Imóvel não encontrado',
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao buscar imóvel',
    });
  }
}
module.exports = {
  listarImoveis,
  buscarImovelPorId,
};