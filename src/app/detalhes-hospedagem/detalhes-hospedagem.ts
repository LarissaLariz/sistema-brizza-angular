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

  usuarioEstaLogado = false;

  responsavelNome = '';
  responsavelEmail = '';
  responsavelPais = 'Brasil';
  responsavelTipoDocumento = 'cpf';
  responsavelDocumento = '';
  responsavelTelefone = '';

  mostrarModalImagem = false;
  mostrarModalAutenticacao = false;

  imagemSelecionada = '';
  indiceImagemAtual = 0;

  mensagemReserva = '';
  mensagemErroReserva = '';
  preReservaCriada = false;
  ultimaReservaId: number | null = null;

  calendarioAberto: 'entrada' | 'saida' | null = null;

  mesCalendario = 0;
  anoCalendario = 0;

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  mesesCalendario = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  diasCalendario: any[] = [];

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.dataHoje = this.gerarDataHoje();

    const hoje = new Date(`${this.dataHoje}T00:00:00`);

    this.mesCalendario = hoje.getMonth();
    this.anoCalendario = hoje.getFullYear();

    this.carregarImoveisDoAdmin();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.hospedagemSelecionada = this.hospedagens.find((hospedagem) => hospedagem.id === id);

    this.carregarDadosResponsavelDoUsuarioLogado();

    this.route.queryParams.subscribe((params) => {
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);

      if (this.dataEntrada) {
        this.definirMesCalendarioPorData(this.dataEntrada);
      }

      this.montarCalendario();
      this.verificarDisponibilidadeSelecionada();
    });
  }

  carregarDadosResponsavelDoUsuarioLogado() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
      this.usuarioEstaLogado = false;
      return;
    }

    try {
      const usuario = JSON.parse(usuarioLogado);

      this.usuarioEstaLogado = true;
      this.responsavelNome = usuario.nome || '';
      this.responsavelEmail = usuario.email || '';
    } catch {
      this.usuarioEstaLogado = false;
    }
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
      this.montarCalendario();
      return;
    }

    this.verificarDisponibilidadeSelecionada();
    this.montarCalendario();
  }

  alterarDataSaida() {
    this.mensagemErroReserva = '';

    if (!this.dataEntrada || !this.dataSaida) {
      return;
    }

    const entrada = new Date(`${this.dataEntrada}T00:00:00`);
    const saida = new Date(`${this.dataSaida}T00:00:00`);

    if (saida <= entrada) {
      this.mensagemErroReserva = 'A data de saída deve ser depois da data de entrada.';
      return;
    }

    this.verificarDisponibilidadeSelecionada();
    this.montarCalendario();
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
    if (!this.hospedagemSelecionada) {
      return;
    }

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
    if (!this.hospedagemSelecionada) {
      return 0;
    }

    return this.quantidadeNoites * this.hospedagemSelecionada.preco;
  }

  pegarSomenteNumeros(valor: string) {
    return valor.replace(/\D/g, '');
  }

  alterarPaisResponsavel(novoPais: string) {
    this.mensagemErroReserva = '';
    this.responsavelPais = novoPais;
    this.responsavelDocumento = '';

    if (this.responsavelPais === 'Brasil') {
      this.responsavelTipoDocumento = 'cpf';
      return;
    }

    this.responsavelTipoDocumento = 'passaporte';
  }

  alterarTipoDocumento(novoTipoDocumento: string) {
    this.mensagemErroReserva = '';
    this.responsavelTipoDocumento = novoTipoDocumento;
    this.responsavelDocumento = '';
  }

  formatarNomeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorFormatado = this.formatarNomeValor(input.value);

    this.responsavelNome = valorFormatado;
    input.value = valorFormatado;
    this.mensagemErroReserva = '';
  }

  formatarEmailInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorFormatado = this.formatarEmailValor(input.value);

    this.responsavelEmail = valorFormatado;
    input.value = valorFormatado;
    this.mensagemErroReserva = '';
  }

  formatarDocumentoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorFormatado = this.formatarDocumentoValor(input.value);

    this.responsavelDocumento = valorFormatado;
    input.value = valorFormatado;
    this.mensagemErroReserva = '';
  }

  formatarTelefoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorFormatado = this.formatarTelefoneValor(input.value);

    this.responsavelTelefone = valorFormatado;
    input.value = valorFormatado;
    this.mensagemErroReserva = '';
  }

  formatarNomeValor(valor: string) {
    return valor
      .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .slice(0, 80);
  }

  formatarEmailValor(valor: string) {
    let email = valor
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/[^a-z0-9._%+\-@]/g, '')
      .slice(0, 120);

    const partes = email.split('@');

    if (partes.length > 2) {
      email = `${partes[0]}@${partes.slice(1).join('').replace(/@/g, '')}`;
    }

    return email;
  }

  formatarDocumentoValor(valor: string) {
    if (this.responsavelTipoDocumento === 'cpf') {
      return this.formatarCpfValor(valor);
    }

    if (this.responsavelTipoDocumento === 'passaporte') {
      return valor
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 20);
    }

    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9\s./-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .slice(0, 30);
  }

  formatarCpfValor(valor: string) {
    const numeros = this.pegarSomenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  formatarTelefoneValor(valor: string) {
    const texto = valor.trim();

    if (texto.startsWith('+')) {
      let resultado = '+';
      let quantidadeNumeros = 0;

      for (let i = 1; i < texto.length; i++) {
        const caractere = texto[i];

        if (/\d/.test(caractere)) {
          if (quantidadeNumeros >= 15) {
            continue;
          }

          quantidadeNumeros++;
          resultado += caractere;
          continue;
        }

        if (/[\s()-]/.test(caractere)) {
          resultado += caractere;
        }
      }

      return resultado.slice(0, 25);
    }

    const numeros = this.pegarSomenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  nomeValido(nome: string) {
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3) {
      return false;
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(nomeLimpo);
  }

  emailValido(email: string) {
    const emailLimpo = email.trim();

    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,6}(\.[A-Za-z]{2,3})?$/.test(emailLimpo);
  }

  cpfValido(cpf: string) {
    const numeros = this.pegarSomenteNumeros(cpf);

    if (numeros.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(numeros)) {
      return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(numeros.charAt(i)) * (10 - i);
    }

    let primeiroDigito = (soma * 10) % 11;

    if (primeiroDigito === 10) {
      primeiroDigito = 0;
    }

    if (primeiroDigito !== Number(numeros.charAt(9))) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(numeros.charAt(i)) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) {
      segundoDigito = 0;
    }

    return segundoDigito === Number(numeros.charAt(10));
  }

  telefoneValido(telefone: string) {
    const telefoneLimpo = telefone.trim();
    const numeros = this.pegarSomenteNumeros(telefoneLimpo);

    if (telefoneLimpo.startsWith('+')) {
      return numeros.length >= 8 && numeros.length <= 15;
    }

    return numeros.length === 10 || numeros.length === 11;
  }

  documentoValido() {
    const documento = this.responsavelDocumento.trim();

    if (this.responsavelTipoDocumento === 'cpf') {
      return this.cpfValido(documento);
    }

    if (this.responsavelTipoDocumento === 'passaporte') {
      return /^[A-Z0-9]{5,20}$/.test(documento);
    }

    return /^[A-Z0-9\s./-]{4,30}$/.test(documento);
  }

  obterNomeTipoDocumento(tipoDocumento: string) {
    if (tipoDocumento === 'cpf') {
      return 'CPF';
    }

    if (tipoDocumento === 'passaporte') {
      return 'Passaporte';
    }

    return 'Outro documento';
  }

  get mesAnoCalendario() {
    return `${this.mesesCalendario[this.mesCalendario]} ${this.anoCalendario}`;
  }

  abrirCalendario(tipo: 'entrada' | 'saida') {
    if (this.preReservaCriada) {
      return;
    }

    this.calendarioAberto = tipo;
    this.mensagemErroReserva = '';

    if (tipo === 'entrada' && this.dataEntrada) {
      this.definirMesCalendarioPorData(this.dataEntrada);
    } else if (tipo === 'saida' && this.dataSaida) {
      this.definirMesCalendarioPorData(this.dataSaida);
    } else if (this.dataEntrada) {
      this.definirMesCalendarioPorData(this.dataEntrada);
    } else {
      this.definirMesCalendarioPorData(this.dataHoje);
    }

    this.montarCalendario();
  }

  definirMesCalendarioPorData(data: string) {
    const dataBase = new Date(`${data}T00:00:00`);

    this.mesCalendario = dataBase.getMonth();
    this.anoCalendario = dataBase.getFullYear();
  }

  voltarMesCalendario() {
    if (this.mesCalendario === 0) {
      this.mesCalendario = 11;
      this.anoCalendario--;
    } else {
      this.mesCalendario--;
    }

    this.montarCalendario();
  }

  avancarMesCalendario() {
    if (this.mesCalendario === 11) {
      this.mesCalendario = 0;
      this.anoCalendario++;
    } else {
      this.mesCalendario++;
    }

    this.montarCalendario();
  }

  formatarDataInput(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  montarCalendario() {
    const primeiroDiaDoMes = new Date(this.anoCalendario, this.mesCalendario, 1);
    const ultimoDiaDoMes = new Date(this.anoCalendario, this.mesCalendario + 1, 0);

    const diaSemanaInicial = primeiroDiaDoMes.getDay();
    const totalDiasMes = ultimoDiaDoMes.getDate();

    const dias: any[] = [];

    for (let i = 0; i < diaSemanaInicial; i++) {
      dias.push({
        data: null,
        numero: null,
        vazia: true,
        bloqueada: false,
        passada: false,
        hoje: false,
        selecionada: false,
        noIntervalo: false,
        motivoBloqueio: '',
      });
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const dataAtual = this.formatarDataInput(
        new Date(this.anoCalendario, this.mesCalendario, dia)
      );

      const bloqueio = this.obterBloqueioDaData(dataAtual);

      dias.push({
        data: dataAtual,
        numero: dia,
        vazia: false,
        bloqueada: !!bloqueio,
        passada: dataAtual < this.dataHoje,
        hoje: dataAtual === this.dataHoje,
        selecionada: dataAtual === this.dataEntrada || dataAtual === this.dataSaida,
        noIntervalo: this.dataEstaNoIntervaloSelecionado(dataAtual),
        motivoBloqueio: bloqueio ? this.montarMotivoBloqueio(bloqueio) : '',
      });
    }

    while (dias.length % 7 !== 0) {
      dias.push({
        data: null,
        numero: null,
        vazia: true,
        bloqueada: false,
        passada: false,
        hoje: false,
        selecionada: false,
        noIntervalo: false,
        motivoBloqueio: '',
      });
    }

    this.diasCalendario = dias;
  }

  dataEstaNoIntervaloSelecionado(data: string) {
    if (!this.dataEntrada || !this.dataSaida) {
      return false;
    }

    return data > this.dataEntrada && data < this.dataSaida;
  }

  buscarReservasSalvas() {
    try {
      return JSON.parse(localStorage.getItem('reservas') || '[]');
    } catch {
      return [];
    }
  }

  buscarBloqueiosManuaisSalvos() {
    try {
      return JSON.parse(localStorage.getItem('bloqueiosDatas') || '[]');
    } catch {
      return [];
    }
  }

  dataDentroDoPeriodo(data: string, entrada: string, saida: string) {
    return data >= entrada && data < saida;
  }

  obterBloqueioDaData(data: string) {
    if (!this.hospedagemSelecionada) {
      return null;
    }

    const reservas = this.buscarReservasSalvas();

    const reservaEncontrada = reservas.find((reserva: any) => {
      const mesmaHospedagemPorId =
        String(reserva.imovelId) === String(this.hospedagemSelecionada.id);

      const mesmaHospedagemAntiga =
        !reserva.imovelId && reserva.titulo === this.hospedagemSelecionada.titulo;

      const mesmaHospedagem = mesmaHospedagemPorId || mesmaHospedagemAntiga;

      const status = reserva.status || 'pendente';

      const reservaBloqueia = status === 'pendente' || status === 'pago';

      if (
        !mesmaHospedagem ||
        !reservaBloqueia ||
        !reserva.dataEntrada ||
        !reserva.dataSaida
      ) {
        return false;
      }

      return this.dataDentroDoPeriodo(data, reserva.dataEntrada, reserva.dataSaida);
    });

    if (reservaEncontrada) {
      return {
        tipo: 'reserva',
        status: reservaEncontrada.status || 'pendente',
        dataEntrada: reservaEncontrada.dataEntrada,
        dataSaida: reservaEncontrada.dataSaida,
      };
    }

    const bloqueios = this.buscarBloqueiosManuaisSalvos();

    const bloqueioEncontrado = bloqueios.find((bloqueio: any) => {
      const mesmaHospedagem =
        String(bloqueio.imovelId) === String(this.hospedagemSelecionada.id);

      if (!mesmaHospedagem || !bloqueio.dataEntrada || !bloqueio.dataSaida) {
        return false;
      }

      return this.dataDentroDoPeriodo(data, bloqueio.dataEntrada, bloqueio.dataSaida);
    });

    if (bloqueioEncontrado) {
      return {
        tipo: 'bloqueio',
        motivo: bloqueioEncontrado.motivo,
        dataEntrada: bloqueioEncontrado.dataEntrada,
        dataSaida: bloqueioEncontrado.dataSaida,
      };
    }

    return null;
  }

  montarMotivoBloqueio(bloqueio: any) {
    return `Indisponível de ${this.formatarData(
      bloqueio.dataEntrada
    )} até ${this.formatarData(bloqueio.dataSaida)}`;
  }

  buscarBloqueioNoPeriodo(entrada: string, saida: string) {
    let dataAtual = new Date(`${entrada}T00:00:00`);
    const dataFinal = new Date(`${saida}T00:00:00`);

    while (dataAtual < dataFinal) {
      const dataFormatada = this.formatarDataInput(dataAtual);
      const bloqueio = this.obterBloqueioDaData(dataFormatada);

      if (bloqueio) {
        return bloqueio;
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return null;
  }

  diaDesabilitado(dia: any) {
    if (!dia.data) {
      return true;
    }

    if (this.preReservaCriada) {
      return true;
    }

    if (dia.passada) {
      return true;
    }

    if (this.calendarioAberto === 'entrada') {
      return dia.bloqueada;
    }

    if (this.calendarioAberto === 'saida') {
      if (!this.dataEntrada) {
        return true;
      }

      if (dia.data <= this.dataEntrada) {
        return true;
      }

      const bloqueioNoPeriodo = this.buscarBloqueioNoPeriodo(this.dataEntrada, dia.data);

      return !!bloqueioNoPeriodo;
    }

    return false;
  }

  obterTituloDia(dia: any) {
    if (!dia.data) {
      return '';
    }

    if (dia.passada) {
      return 'Data indisponível';
    }

    if (this.calendarioAberto === 'saida' && dia.bloqueada && !this.diaDesabilitado(dia)) {
      return 'Permitido como data de saída';
    }

    if (dia.motivoBloqueio) {
      return dia.motivoBloqueio;
    }

    return 'Data disponível';
  }

  selecionarDiaCalendario(dia: any) {
    if (this.diaDesabilitado(dia)) {
      return;
    }

    if (!dia.data) {
      return;
    }

    const dataSelecionada = String(dia.data);

    this.mensagemErroReserva = '';

    if (this.calendarioAberto === 'entrada') {
      this.dataEntrada = dataSelecionada;

      const saidaAtual = this.dataSaida;

      if (
        saidaAtual &&
        (saidaAtual <= dataSelecionada ||
          this.buscarBloqueioNoPeriodo(dataSelecionada, saidaAtual))
      ) {
        this.dataSaida = null;
      }

      this.calendarioAberto = 'saida';
      this.montarCalendario();
      return;
    }

    if (this.calendarioAberto === 'saida') {
      const entradaAtual = this.dataEntrada;

      if (!entradaAtual) {
        this.mensagemErroReserva = 'Selecione primeiro a data de entrada.';
        this.calendarioAberto = 'entrada';
        this.montarCalendario();
        return;
      }

      if (dataSelecionada <= entradaAtual) {
        this.mensagemErroReserva = 'A data de saída deve ser depois da data de entrada.';
        return;
      }

      const bloqueioNoPeriodo = this.buscarBloqueioNoPeriodo(
        entradaAtual,
        dataSelecionada
      );

      if (bloqueioNoPeriodo) {
        this.mensagemErroReserva =
          this.montarMensagemPeriodoIndisponivel(bloqueioNoPeriodo);
        return;
      }

      this.dataSaida = dataSelecionada;
      this.calendarioAberto = null;
      this.verificarDisponibilidadeSelecionada();
      this.montarCalendario();
    }
  }

  buscarPeriodoIndisponivel() {
    if (!this.dataEntrada || !this.dataSaida) {
      return null;
    }

    return this.buscarBloqueioNoPeriodo(this.dataEntrada, this.dataSaida);
  }

  montarMensagemPeriodoIndisponivel(bloqueio: any) {
    return `Este período não está disponível. Escolha outras datas.`;
  }

  verificarDisponibilidadeSelecionada() {
    if (!this.dataEntrada || !this.dataSaida) {
      return;
    }

    const bloqueioNoPeriodo = this.buscarPeriodoIndisponivel();

    if (bloqueioNoPeriodo) {
      this.mensagemErroReserva =
        this.montarMensagemPeriodoIndisponivel(bloqueioNoPeriodo);
    }
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

    const periodoIndisponivel = this.buscarPeriodoIndisponivel();

    if (periodoIndisponivel) {
      this.mensagemErroReserva =
        this.montarMensagemPeriodoIndisponivel(periodoIndisponivel);
      return;
    }

    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
      this.mostrarModalAutenticacao = true;
      return;
    }

    let usuario: any;

    try {
      usuario = JSON.parse(usuarioLogado);
    } catch {
      this.mensagemErroReserva =
        'Não foi possível ler os dados do usuário logado. Saia da conta e faça login novamente.';
      return;
    }

    if (!usuario.email) {
      this.mensagemErroReserva =
        'Não foi possível identificar o e-mail do usuário logado. Saia da conta e faça login novamente.';
      return;
    }

    if (!this.nomeValido(this.responsavelNome)) {
      this.mensagemErroReserva =
        'Informe um nome válido. Use apenas letras, espaços e acentos.';
      return;
    }

    if (!this.responsavelEmail.trim()) {
      this.mensagemErroReserva = 'Informe o e-mail do responsável pela reserva.';
      return;
    }

    if (!this.emailValido(this.responsavelEmail)) {
      this.mensagemErroReserva = 'Informe um e-mail válido para o responsável pela reserva.';
      return;
    }

    if (!this.responsavelPais.trim()) {
      this.mensagemErroReserva = 'Informe o país do responsável pela reserva.';
      return;
    }

    if (!this.responsavelTipoDocumento) {
      this.mensagemErroReserva = 'Selecione o tipo de documento.';
      return;
    }

    if (this.responsavelPais === 'Brasil' && this.responsavelTipoDocumento !== 'cpf') {
      this.mensagemErroReserva = 'Para responsáveis do Brasil, informe CPF.';
      return;
    }

    if (!this.responsavelDocumento.trim()) {
      this.mensagemErroReserva = 'Informe o número do documento.';
      return;
    }

    if (!this.documentoValido()) {
      if (this.responsavelTipoDocumento === 'cpf') {
        this.mensagemErroReserva = 'Informe um CPF válido.';
        return;
      }

      if (this.responsavelTipoDocumento === 'passaporte') {
        this.mensagemErroReserva =
          'Informe um passaporte válido. Use apenas letras e números de 5 a 20 caracteres.';
        return;
      }

      this.mensagemErroReserva = 'Informe um documento válido.';
      return;
    }

    if (!this.telefoneValido(this.responsavelTelefone)) {
      this.mensagemErroReserva =
        'Informe um telefone válido. Para telefone internacional, comece com + e o código do país.';
      return;
    }

    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const reservaId = new Date().getTime();

    const novaReserva = {
      id: reservaId,

      usuarioEmail: usuario.email,
      usuarioNome: usuario.nome || 'Cliente sem nome',

      responsavelNome: this.responsavelNome.trim(),
      responsavelEmail: this.responsavelEmail.trim(),
      responsavelPais: this.responsavelPais.trim(),
      responsavelTipoDocumento: this.responsavelTipoDocumento,
      responsavelDocumento: this.responsavelDocumento.trim(),
      responsavelCpf:
        this.responsavelTipoDocumento === 'cpf' ? this.responsavelDocumento.trim() : '',
      responsavelTelefone: this.responsavelTelefone.trim(),

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
    this.mensagemReserva =
      'Solicitação registrada. Sua reserva ainda não está confirmada. Realize o pagamento para confirmar.';

    this.montarCalendario();
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

    const tipoDocumento = this.obterNomeTipoDocumento(
      reserva.responsavelTipoDocumento || 'outro'
    );

    const documento =
      reserva.responsavelDocumento || reserva.responsavelCpf || 'Não informado';

    const mensagem = `Olá! Quero realizar o pagamento da minha reserva:

Imóvel: ${reserva.titulo}
Entrada: ${this.formatarData(reserva.dataEntrada)}
Saída: ${this.formatarData(reserva.dataSaida)}
Hóspedes: ${reserva.adultos + reserva.criancas}
Responsável: ${reserva.responsavelNome || reserva.usuarioNome}
País: ${reserva.responsavelPais || 'Não informado'}
Documento (${tipoDocumento}): ${documento}
Telefone: ${reserva.responsavelTelefone || 'Não informado'}
E-mail: ${reserva.responsavelEmail || reserva.usuarioEmail}
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