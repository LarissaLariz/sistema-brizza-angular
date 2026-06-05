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

async function listarReservasPorImovel(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        id,
        imovel_id,
        data_entrada,
        data_saida,
        status
      FROM reservas
      WHERE imovel_id = $1
        AND status IN ('pendente', 'pago')
      ORDER BY data_entrada ASC
      `,
      [id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao buscar reservas do imóvel',
    });
  }
}

async function criarReserva(req, res) {
  try {
    const {
      usuarioEmail,
      usuarioNome,
      imovelId,
      tituloImovel,
      dataEntrada,
      dataSaida,
      adultos,
      criancas,
      total,
    } = req.body;

    const reservaConflitante = await pool.query(
      `
      SELECT *
      FROM reservas
      WHERE imovel_id = $1
        AND status IN ('pendente', 'pago')
        AND $2 < data_saida
        AND $3 > data_entrada
      LIMIT 1
      `,
      [imovelId, dataEntrada, dataSaida],
    );

    if (reservaConflitante.rows.length > 0) {
      return res.status(409).json({
        erro: 'Já existe uma reserva para este imóvel nessas datas',
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO reservas (
        usuario_email,
        usuario_nome,
        imovel_id,
        titulo_imovel,
        data_entrada,
        data_saida,
        adultos,
        criancas,
        total,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        usuarioEmail,
        usuarioNome,
        imovelId,
        tituloImovel,
        dataEntrada,
        dataSaida,
        adultos,
        criancas,
        total,
        'pendente',
      ],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao criar reserva',
    });
  }
}

module.exports = {
  listarReservas,
  listarReservasPorImovel,
  criarReserva,
};