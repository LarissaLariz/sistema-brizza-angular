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
        total
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
  criarReserva,
};