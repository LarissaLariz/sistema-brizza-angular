
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
    res.status(500).json({ erro: 'Erro ao buscar reservas' });
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
    res.status(500).json({ erro: 'Erro ao buscar reservas do imóvel' });
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
      responsavelNome,
      responsavelEmail,
      responsavelPais,
      responsavelTipoDocumento,
      responsavelDocumento,
      responsavelTelefone,
      hospedesAdicionais,
    } = req.body;

    if (!imovelId || !dataEntrada || !dataSaida || dataSaida <= dataEntrada) {
      return res.status(400).json({
        erro: 'Informe o imóvel e um período válido para a reserva.',
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
        erro: 'Este imóvel está bloqueado para o período selecionado.',
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
        erro: 'Já existe uma reserva para este imóvel nessas datas.',
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
        status,
        responsavel_nome,
        responsavel_email,
        responsavel_pais,
        responsavel_tipo_documento,
        responsavel_documento,
        responsavel_telefone,
        hospedes_adicionais
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb)
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
        responsavelNome,
        responsavelEmail,
        responsavelPais,
        responsavelTipoDocumento,
        responsavelDocumento,
        responsavelTelefone,
        JSON.stringify(hospedesAdicionais || []),
      ],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar reserva' });
  }
}

async function atualizarStatusReserva(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendente', 'pago', 'cancelada'].includes(status)) {
      return res.status(400).json({
        erro: 'Status de reserva inválido.',
      });
    }

    const resultado = await pool.query(
      `
      UPDATE reservas
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Reserva não encontrada.',
      });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: 'Erro ao atualizar status da reserva.',
    });
  }
}

module.exports = {
  listarReservas,
  listarReservasPorImovel,
  criarReserva,
  atualizarStatusReserva,
};
