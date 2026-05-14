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
  dataHoje = '';

  adultos = 0;
  criancas = 0;

  mostrarModalImagem = false;
  mostrarModalAutenticacao = false;

  imagemSelecionada = '';
  indiceImagemAtual = 0;

  mensagemReserva = '';
  mensagemErroReserva = '';
  preReservaCriada = false;
  ultimaReservaId: number | null = null;

  hospedagens: any[] = [
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
        '/images/imagem2.jpeg',
      ],
      preco: 200,
      hospedes: 4,
      quartos: 1,
      comodidades: [
        { icone: '📶', nome: 'Wi-Fi' },
        { icone: '🏊', nome: 'Piscina' },
        { icone: '❄️', nome: 'Ar-condicionado' },
        { icone: '🍳', nome: 'Cozinha' },
      ],
    },
    {
      id: 2,
      titulo: 'Loft no centro',
      local: 'Tombo',
      descricao: 'Vista para a cidade',
      imagens: ['/images/imagem2.jpeg', '/images/imagem1.jpeg', '/images/imagem3.jpeg'],
      preco: 180,
      hospedes: 4,
      quartos: 1,
      comodidades: [
        { icone: '📶', nome: 'Wi-Fi' },
        { icone: '🍳', nome: 'Cozinha' },
      ],
    },
    {
      id: 3,
      titulo: 'Loft na serra',
      local: 'Astúrias',
      descricao: 'Vista para a montanha',
      imagens: ['/images/imagem3.jpeg', '/images/imagem1.jpeg', '/images/imagem2.jpeg'],
      preco: 220,
      hospedes: 4,
      quartos: 1,
      comodidades: [
        { icone: '📶', nome: 'Wi-Fi' },
        { icone: '❄️', nome: 'Ar-condicionado' },
      ],
    },
  ];
  abrirSeletorData(input: HTMLInputElement) {
    if (this.preReservaCriada) {
      return;
    }

    if ((input as any).showPicker) {
      (input as any).showPicker();
      return;
    }

    input.focus();
  }
  alterarDataEntrada() {
    this.mensagemErroReserva = '';

    if (!this.dataEntrada || !this.dataSaida) {
      return;
    }

    const entrada = new Date(`${this.dataEntrada}T00:00:00`);
    const saida = new Date(`${this.dataSaida}T00:00:00`);

    if (saida <= entrada) {
      this.dataSaida = null;
    }
  }

  alterarDataSaida() {
    this.mensagemErroReserva = '';
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.dataHoje = this.gerarDataHoje();

    this.carregarImoveisDoAdmin();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.hospedagemSelecionada = this.hospedagens.find((hospedagem) => hospedagem.id === id);

    this.route.queryParams.subscribe((params) => {
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }

  gerarDataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  carregarImoveisDoAdmin() {
    const dados = localStorage.getItem('imoveis');

    if (!dados) {
      return;
    }

    try {
      const imoveisAdmin = JSON.parse(dados);

      const imoveisFormatados = imoveisAdmin.map((imovel: any) => {
        return {
          ...imovel,
          imagens: imovel.imagens || [],
          comodidades: this.formatarComodidades(imovel.comodidades || []),
        };
      });

      this.hospedagens = [...this.hospedagens, ...imoveisFormatados];
    } catch {
      return;
    }
  }

  formatarComodidades(comodidades: any[]) {
    return comodidades.map((comodidade) => {
      if (typeof comodidade === 'object') {
        return comodidade;
      }

      return {
        icone: this.buscarIconeComodidade(comodidade),
        nome: comodidade,
      };
    });
  }

  buscarIconeComodidade(comodidade: string) {
    const icones: any = {
      'Wi-Fi': '📶',
      Piscina: '🏊',
      'Ar-condicionado': '❄️',
      Cozinha: '🍳',
      Garagem: '🚗',
      TV: '📺',
      Churrasqueira: '🔥',
      Elevador: '🛗',
    };

    return icones[comodidade] || '✓';
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  formatarData(data: string) {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    const meses = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];

    return `${Number(dia)} de ${meses[Number(mes) - 1]}`;
  }

  formatarPreco(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
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
    this.indiceImagemAtual = (this.indiceImagemAtual - 1 + total) % total;
    this.imagemSelecionada = this.hospedagemSelecionada.imagens[this.indiceImagemAtual];
  }

  get quantidadeNoites() {
    if (!this.dataEntrada || !this.dataSaida) return 0;

    const entrada = new Date(`${this.dataEntrada}T00:00:00`);
    const saida = new Date(`${this.dataSaida}T00:00:00`);

    return (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24);
  }

  get valorTotalReserva() {
    return this.quantidadeNoites * this.hospedagemSelecionada.preco;
  }

  confirmarReserva() {
    if (this.preReservaCriada) {
      return;
    }

    this.mensagemReserva = '';
    this.mensagemErroReserva = '';

    if (!this.dataEntrada || !this.dataSaida) {
      this.mensagemErroReserva = 'Informe a data de entrada e a data de saída.';
      return;
    }

    const entrada = new Date(`${this.dataEntrada}T00:00:00`);
    const saida = new Date(`${this.dataSaida}T00:00:00`);
    const hoje = new Date(`${this.dataHoje}T00:00:00`);

    if (entrada < hoje) {
      this.mensagemErroReserva = 'A data de entrada não pode ser anterior à data atual.';
      return;
    }

    if (saida <= entrada) {
      this.mensagemErroReserva = 'A data de saída deve ser depois da data de entrada.';
      return;
    }

    if (this.adultos + this.criancas === 0) {
      this.mensagemErroReserva = 'Informe pelo menos 1 hóspede.';
      return;
    }

    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
      this.mostrarModalAutenticacao = true;
      return;
    }

    const usuario = JSON.parse(usuarioLogado);
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const reservaId = new Date().getTime();

    const novaReserva = {
      id: reservaId,
      usuarioEmail: usuario.email,
      usuarioNome: usuario.nome,
      imovelId: this.hospedagemSelecionada.id,
      titulo: this.hospedagemSelecionada.titulo,
      dataEntrada: this.dataEntrada,
      dataSaida: this.dataSaida,
      adultos: this.adultos,
      criancas: this.criancas,
      total: this.valorTotalReserva,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
    };

    reservas.push(novaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));

    this.ultimaReservaId = reservaId;
    this.preReservaCriada = true;
    this.mensagemReserva = 'Solicitação registrada. Sua reserva será confirmada após o pagamento.';
  }

  fecharModalAutenticacao() {
    this.mostrarModalAutenticacao = false;
  }

  irParaLoginReserva() {
    this.router.navigate(['/login'], {
      queryParams: {
        id: this.hospedagemSelecionada.id,
        dataEntrada: this.dataEntrada,
        dataSaida: this.dataSaida,
        adultos: this.adultos,
        criancas: this.criancas,
      },
    });
  }

  irParaCadastroReserva() {
    this.router.navigate(['/cadastro'], {
      queryParams: {
        id: this.hospedagemSelecionada.id,
        dataEntrada: this.dataEntrada,
        dataSaida: this.dataSaida,
        adultos: this.adultos,
        criancas: this.criancas,
      },
    });
  }

  irParaPagamentoWhatsappUltima() {
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

    const reserva = reservas.find((item: any) => item.id === this.ultimaReservaId);

    if (!reserva) return;

    const mensagem = `Olá! Quero realizar o pagamento da minha reserva:

Imóvel: ${reserva.titulo}
Entrada: ${this.formatarData(reserva.dataEntrada)}
Saída: ${this.formatarData(reserva.dataSaida)}
Hóspedes: ${reserva.adultos + reserva.criancas}
Total: ${this.formatarPreco(reserva.total)}`;

    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  }

  irParaMinhaReserva() {
    this.router.navigate(['/minhas-reservas'], {
      queryParams: {
        reservaId: this.ultimaReservaId,
      },
    });
  }
}
