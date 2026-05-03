import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalhes-hospedagem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-hospedagem.html',
  styleUrl: './detalhes-hospedagem.css',
})
export class DetalhesHospedagem {
  hospedagemSelecionada: any = null;

  dataEntrada: string | null = null;
  dataSaida: string | null = null;
  adultos = 0;
  criancas = 0;
  mostrarModalReserva = false;
  mostrarModalImagem = false;
  imagemSelecionada = '';
  indiceImagemAtual = 0;

  hospedagens = [
    {
      id: 1,
      titulo: 'Golden Beach 158',
      local: 'Pitangueiras',
      descricao: 'Hospedagem confortável no Guarujá, com piscina, boa localização e vista agradável.',
      imagem: '/images/imagem1.jpeg',
      imagens: [
        '/images/imagem1.jpeg',
        '/images/imagem2.jpeg',
        '/images/imagem3.jpeg',
        '/images/imagem1.jpeg',
        '/images/imagem2.jpeg'
      ],
      preco: 200,
      hospedes: 4,
      quartos: 1,
      comodidades: [
        { icone: '📶', nome: 'Wi-Fi' },
        { icone: '🏊', nome: 'Piscina' },
        { icone: '❄️', nome: 'Ar-condicionado' },
        { icone: '🍳', nome: 'Cozinha' }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    this.hospedagemSelecionada = this.hospedagens.find((item) => item.id === id);

    this.route.queryParams.subscribe((params) => {
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }

  formatarData(data: string | null) {
    if (!data) {
      return 'Não informada';
    }

    const [ano, mes, dia] = data.split('-');

    const meses = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];

    return `${Number(dia)} de ${meses[Number(mes) - 1]}`;
  }

  get textoPeriodoReserva() {
    if (!this.dataEntrada && !this.dataSaida) {
      return 'Datas não informadas';
    }

    if (this.dataEntrada && this.dataSaida) {
      return `${this.formatarData(this.dataEntrada)} - ${this.formatarData(this.dataSaida)}`;
    }

    return this.formatarData(this.dataEntrada || this.dataSaida);
  }

  get textoHospedesReserva() {
    const total = this.adultos + this.criancas;

    if (total === 0) {
      return 'Hóspedes não informados';
    }

    return `${total} hóspede(s)`;
  }

  get quantidadeNoites() {
    if (!this.dataEntrada || !this.dataSaida) {
      return 0;
    }

    const entrada = new Date(this.dataEntrada);
    const saida = new Date(this.dataSaida);

    const diferenca = saida.getTime() - entrada.getTime();
    const noites = diferenca / (1000 * 60 * 60 * 24);

    return noites > 0 ? noites : 0;
  }

  get valorTotalReserva() {
    return this.quantidadeNoites * this.hospedagemSelecionada.preco;
  }

  alterarQuantidade(tipo: 'adultos' | 'criancas', valor: number) {
    const total = this.adultos + this.criancas;
    const limite = this.hospedagemSelecionada.hospedes;

    if (tipo === 'adultos') {
      const novoValor = this.adultos + valor;

      if (novoValor < 0) return;
      if (valor > 0 && total >= limite) return;

      this.adultos = novoValor;
    }

    if (tipo === 'criancas') {
      const novoValor = this.criancas + valor;

      if (novoValor < 0) return;
      if (valor > 0 && total >= limite) return;

      this.criancas = novoValor;
    }
  }

  abrirModalReserva() {
    this.mostrarModalReserva = true;
  }

  fecharModalReserva() {
    this.mostrarModalReserva = false;
  }
abrirImagem(imagem: string) {
  this.indiceImagemAtual = this.hospedagemSelecionada.imagens.indexOf(imagem);
  this.imagemSelecionada = imagem;
  this.mostrarModalImagem = true;
}
proximaImagem() {
  const total = this.hospedagemSelecionada.imagens.length;
  this.indiceImagemAtual = (this.indiceImagemAtual + 1) % total;
  this.imagemSelecionada = this.hospedagemSelecionada.imagens[this.indiceImagemAtual];
}

imagemAnterior() {
  const total = this.hospedagemSelecionada.imagens.length;
  this.indiceImagemAtual =
    (this.indiceImagemAtual - 1 + total) % total;
  this.imagemSelecionada = this.hospedagemSelecionada.imagens[this.indiceImagemAtual];
}

fecharImagem() {
  this.mostrarModalImagem = false;
  this.imagemSelecionada = '';
}

  voltar() {
    this.router.navigate(['/home']);
  }

  entrarWhatsapp() {
    const telefone = '5511999999999';

    const mensagem =
`Olá! Tenho interesse no imóvel ${this.hospedagemSelecionada.titulo}

Local: ${this.hospedagemSelecionada.local} - Guarujá
Preço: R$ ${this.hospedagemSelecionada.preco} por noite

Datas: ${this.textoPeriodoReserva}
Hóspedes: ${this.textoHospedesReserva}
Total: R$ ${this.valorTotalReserva}`;

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  }
}