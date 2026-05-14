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

  mensagemReserva = '';

  hospedagens = [
    {
      id: 1,
      titulo: 'Golden Beach 158',
      local: 'Pitangueiras',
      descricao: 'Hospedagem confortável no Guarujá...',
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.hospedagemSelecionada = this.hospedagens.find(h => h.id === id);

    this.route.queryParams.subscribe(params => {
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro'], {
      queryParams: {
        id: this.hospedagemSelecionada.id
      }
    });
  }

  formatarData(data: string) {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    const meses = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];

    return `${Number(dia)} de ${meses[Number(mes) - 1]}`;
  }

  alterarQuantidade(tipo: 'adultos' | 'criancas', valor: number) {
    const total = this.adultos + this.criancas;
    const limite = this.hospedagemSelecionada.hospedes;

    if (tipo === 'adultos') {
      const novo = this.adultos + valor;
      if (novo < 0) return;
      if (valor > 0 && total >= limite) return;
      this.adultos = novo;
    }

    if (tipo === 'criancas') {
      const novo = this.criancas + valor;
      if (novo < 0) return;
      if (valor > 0 && total >= limite) return;
      this.criancas = novo;
    }
  }

  abrirImagem(img: string) {
    this.imagemSelecionada = img;
    this.indiceImagemAtual = this.hospedagemSelecionada.imagens.indexOf(img);
    this.mostrarModalImagem = true;
  }

  fecharImagem() {
    this.mostrarModalImagem = false;
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

  abrirModalReserva() {
    this.confirmarReserva();
  }

  fecharModalReserva() {
    this.mostrarModalReserva = false;
  }

  get quantidadeNoites() {
    if (!this.dataEntrada || !this.dataSaida) return 0;

    const entrada = new Date(this.dataEntrada);
    const saida = new Date(this.dataSaida);

    return (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24);
  }

  get valorTotalReserva() {
    return this.quantidadeNoites * this.hospedagemSelecionada.preco;
  }

  get textoPeriodoReserva() {
    if (!this.dataEntrada || !this.dataSaida) return 'Datas não informadas';

    return `${this.formatarData(this.dataEntrada)} - ${this.formatarData(this.dataSaida)}`;
  }

  get textoHospedesReserva() {
    const total = this.adultos + this.criancas;
    return total ? `${total} hóspedes` : 'Não informado';
  }

  confirmarReserva() {
    this.mensagemReserva = '';

    if (!this.dataEntrada || !this.dataSaida) {
      this.mensagemReserva = 'Selecione as datas';
      return;
    }

    if (this.adultos + this.criancas === 0) {
      this.mensagemReserva = 'Informe ao menos 1 hóspede';
      return;
    }

    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

    const novaReserva = {
      titulo: this.hospedagemSelecionada.titulo,
      dataEntrada: this.dataEntrada,
      dataSaida: this.dataSaida,
      adultos: this.adultos,
      criancas: this.criancas,
      total: this.valorTotalReserva,
      status: 'pendente'
    };

    reservas.push(novaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));

    this.mensagemReserva = 'Reserva criada! Finalize o pagamento no WhatsApp';
  }

  irParaPagamentoWhatsappUltima() {
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const r = reservas[reservas.length - 1];

    if (!r) return;

    const mensagem =
`Olá! Quero finalizar o pagamento da minha reserva:

Imóvel: ${r.titulo}
Entrada: ${this.formatarData(r.dataEntrada)}
Saída: ${this.formatarData(r.dataSaida)}
Hóspedes: ${r.adultos + r.criancas}
Total: R$ ${r.total}`;

    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  }

  entrarWhatsapp() {
    window.open('https://wa.me/5511999999999', '_blank');
  }
}