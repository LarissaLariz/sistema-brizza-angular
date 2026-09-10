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

async function criarImovel(req, res) {
  try {
    const { nome, cidade, descricao, preco_por_noite, capacidade_maxima, imagens } = req.body;

    if (!nome || !cidade || !descricao || !preco_por_noite || !capacidade_maxima) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, cidade, descricao, preco_por_noite, capacidade_maxima',
      });
    }

    const resultado = await pool.query(
      `INSERT INTO imoveis (nome, cidade, descricao, preco_por_noite, capacidade_maxima, imagens, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [nome, cidade, descricao, preco_por_noite, capacidade_maxima, JSON.stringify(imagens || [])]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao criar imóvel',
    });
  }
}

async function atualizarImovel(req, res) {
  try {
    const { id } = req.params;
    const { nome, cidade, descricao, preco_por_noite, capacidade_maxima, imagens } = req.body;

    const resultado = await pool.query(
      `UPDATE imoveis
       SET nome = $1, cidade = $2, descricao = $3, preco_por_noite = $4, capacidade_maxima = $5, imagens = $6
       WHERE id = $7
       RETURNING *`,
      [nome, cidade, descricao, preco_por_noite, capacidade_maxima, JSON.stringify(imagens || []), id]
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
      erro: 'Erro ao atualizar imóvel',
    });
  }
}

async function removerImovel(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE imoveis
       SET ativo = false
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Imóvel não encontrado',
      });
    }

    res.json({ sucesso: true });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao remover imóvel',
    });
  }
}

module.exports = {
  listarImoveis,
  buscarImovelPorId,
  criarImovel,
  atualizarImovel,
  removerImovel,
};