
const pool = require('../database/connection');

async function listarBloqueios(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        imovel_id AS "imovelId",
        data_entrada AS "dataEntrada",
        data_saida AS "dataSaida",
        motivo,
        criado_em AS "dataCriacao"
      FROM bloqueios_datas
      ORDER BY data_entrada ASC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar bloqueios.' });
  }
}

async function criarBloqueio(req, res) {
  try {
    const { imovelId, dataEntrada, dataSaida, motivo } = req.body;

    if (!imovelId || !dataEntrada || !dataSaida || !motivo?.trim()) {
      return res.status(400).json({
        erro: 'Informe o imóvel, as datas e o motivo do bloqueio.',
      });
    }

    if (dataSaida <= dataEntrada) {
      return res.status(400).json({
        erro: 'A data final deve ser posterior à data inicial.',
      });
    }

    const reservaConflitante = await pool.query(
      `
      SELECT id
      FROM reservas
      WHERE imovel_id = $1
        AND status IN ('pendente', 'pago')
        AND $2::date < data_saida
        AND $3::date > data_entrada
      LIMIT 1
      `,
      [imovelId, dataEntrada, dataSaida],
    );

    if (reservaConflitante.rows.length > 0) {
      return res.status(409).json({
        erro: 'O período conflita com uma reserva existente.',
      });
    }

    const bloqueioConflitante = await pool.query(
      `
      SELECT id
      FROM bloqueios_datas
      WHERE imovel_id = $1
        AND $2::date < data_saida
        AND $3::date > data_entrada
      LIMIT 1
      `,
      [imovelId, dataEntrada, dataSaida],
    );

    if (bloqueioConflitante.rows.length > 0) {
      return res.status(409).json({
        erro: 'O período conflita com outro bloqueio.',
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO bloqueios_datas (
        imovel_id,
        data_entrada,
        data_saida,
        motivo
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        imovel_id AS "imovelId",
        data_entrada AS "dataEntrada",
        data_saida AS "dataSaida",
        motivo,
        criado_em AS "dataCriacao"
      `,
      [imovelId, dataEntrada, dataSaida, motivo.trim()],
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar bloqueio.' });
  }
}

async function removerBloqueio(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      DELETE FROM bloqueios_datas
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Bloqueio não encontrado.',
      });
    }

    return res.json({ mensagem: 'Bloqueio removido com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao remover bloqueio.' });
  }
}

module.exports = {
  listarBloqueios,
  criarBloqueio,
  removerBloqueio,
};
