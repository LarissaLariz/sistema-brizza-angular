import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.html',
  styleUrl: './minhas-reservas.css',
})
export class MinhasReservas implements OnDestroy {
  private apiReservasUrl = 'http://localhost:3000/reservas';

  usuarioLogado: any = null;
  reservas: any[] = [];
  reservaDestacadaId: number | null = null;

  carregandoReservas = false;
  erroReservas = '';

  cronometroReservas: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    const usuario = localStorage.getItem('usuarioLogado');

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogado = JSON.parse(usuario);

    const reservaId = this.route.snapshot.queryParamMap.get('reservaId');

    if (reservaId) {
      this.reservaDestacadaId = Number(reservaId);
    }

    this.carregarReservas();
    this.iniciarCronometroReservas();
  }

  ngOnDestroy() {
    if (this.cronometroReservas) {
      clearInterval(this.cronometroReservas);
      this.cronometroReservas = null;
    }
  }

  carregarReservas() {
    this.carregandoReservas = true;
    this.erroReservas = '';

    this.http.get<any[]>(this.apiReservasUrl).subscribe({
      next: (reservasApi) => {
        const reservasBackend = reservasApi.map((reserva) =>
          this.montarReservaVindaDoBackend(reserva),
        );

        const reservasUsuarioBackend = reservasBackend.filter(
          (reserva) => reserva.usuarioEmail === this.usuarioLogado.email,
        );

        const reservasLocal = this.carregarReservasLocalStorage();

        const reservasUnidas = this.unirReservas(reservasUsuarioBackend, reservasLocal);

        this.reservas = reservasUnidas.sort((a: any, b: any) => {
          const dataA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
          const dataB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;

          return dataB - dataA;
        });

        this.carregandoReservas = false;
        this.cdr.detectChanges();
        this.rolarParaReservaDestacada();
      },
      error: (erro) => {
        console.error('Erro ao carregar reservas da API:', erro);

        const reservasLocal = this.carregarReservasLocalStorage();

        this.reservas = reservasLocal.sort((a: any, b: any) => {
          const dataA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
          const dataB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;

          return dataB - dataA;
        });

        this.carregandoReservas = false;

        if (this.reservas.length === 0) {
          this.erroReservas =
            'Não foi possível carregar suas reservas. Verifique se o backend está rodando.';
        }

        this.cdr.detectChanges();
        this.rolarParaReservaDestacada();
      },
    });
  }

  carregarReservasLocalStorage() {
    const dados = localStorage.getItem('reservas');
    const todasReservas = dados ? JSON.parse(dados) : [];

    return todasReservas
      .filter((reserva: any) => reserva.usuarioEmail === this.usuarioLogado.email)
      .map((reserva: any) => {
        const dataCriacao = reserva.dataCriacao || reserva.criado_em || new Date().toISOString();

        return {
          ...reserva,
          origem: 'local',
          dataEntrada: this.converterDataDoBackend(
            reserva.dataEntrada || reserva.data_entrada,
          ),
          dataSaida: this.converterDataDoBackend(reserva.dataSaida || reserva.data_saida),
          total: Number(reserva.total || 0),
          dataCriacao,
          hospedesAdicionais: this.montarHospedesDaReserva(
            reserva.hospedesAdicionais || reserva.hospedes_adicionais,
          ),
          expiraEm: reserva.expiraEm || this.calcularExpiracaoPadrao(dataCriacao),
        };
      });
  }

  montarReservaVindaDoBackend(reserva: any) {
    const dataCriacao = reserva.criado_em || reserva.dataCriacao || new Date().toISOString();

    return {
      ...reserva,
      origem: 'api',
      id: Number(reserva.id),
      usuarioEmail: reserva.usuario_email || reserva.usuarioEmail,
      usuarioNome: reserva.usuario_nome || reserva.usuarioNome,
      titulo: reserva.titulo_imovel || reserva.tituloImovel || reserva.titulo,
      tituloImovel: reserva.titulo_imovel || reserva.tituloImovel || reserva.titulo,
      dataEntrada: this.converterDataDoBackend(reserva.data_entrada || reserva.dataEntrada),
      dataSaida: this.converterDataDoBackend(reserva.data_saida || reserva.dataSaida),
      adultos: Number(reserva.adultos || 0),
      criancas: Number(reserva.criancas || 0),
      total: Number(reserva.total || 0),
      status: reserva.status || 'pendente',
      dataCriacao,

      responsavelNome:
        reserva.responsavel_nome ||
        reserva.responsavelNome ||
        reserva.usuario_nome ||
        reserva.usuarioNome,

      responsavelEmail:
        reserva.responsavel_email ||
        reserva.responsavelEmail ||
        reserva.usuario_email ||
        reserva.usuarioEmail,

      responsavelPais:
        reserva.responsavel_pais ||
        reserva.responsavelPais ||
        'Não informado',

      responsavelTipoDocumento:
        reserva.responsavel_tipo_documento ||
        reserva.responsavelTipoDocumento ||
        '',

      responsavelDocumento:
        reserva.responsavel_documento ||
        reserva.responsavelDocumento ||
        reserva.responsavelCpf ||
        '',

      responsavelTelefone:
        reserva.responsavel_telefone ||
        reserva.responsavelTelefone ||
        '',

      hospedesAdicionais: this.montarHospedesDaReserva(
        reserva.hospedes_adicionais || reserva.hospedesAdicionais,
      ),

      expiraEm: reserva.expira_em || reserva.expiraEm || this.calcularExpiracaoPadrao(dataCriacao),
    };
  }

  montarHospedesDaReserva(hospedes: any) {
    if (!hospedes) {
      return [];
    }

    if (Array.isArray(hospedes)) {
      return hospedes.map((hospede) => this.montarHospedeDaReserva(hospede));
    }

    try {
      const hospedesConvertidos = JSON.parse(hospedes);

      if (Array.isArray(hospedesConvertidos)) {
        return hospedesConvertidos.map((hospede) => this.montarHospedeDaReserva(hospede));
      }

      return [];
    } catch {
      return [];
    }
  }

  montarHospedeDaReserva(hospede: any) {
    return {
      tipo: hospede?.tipo || '',
      nome: hospede?.nome || '',
      cpf: hospede?.cpf || '',
      idade: hospede?.idade ?? '',
    };
  }

  obterHospedesAdicionais(reserva: any) {
    if (!Array.isArray(reserva.hospedesAdicionais)) {
      return [];
    }

    return reserva.hospedesAdicionais;
  }

  temHospedesAdicionais(reserva: any) {
    return this.obterHospedesAdicionais(reserva).length > 0;
  }

  unirReservas(reservasBackend: any[], reservasLocal: any[]) {
    const mapa = new Map<string, any>();

    reservasLocal.forEach((reserva) => {
      mapa.set(`local-${reserva.id}`, reserva);
    });

    reservasBackend.forEach((reserva) => {
      mapa.set(`api-${reserva.id}`, reserva);
    });

    return Array.from(mapa.values());
  }

  converterDataDoBackend(data: string) {
    if (!data) {
      return '';
    }

    return String(data).slice(0, 10);
  }

  calcularExpiracaoPadrao(dataCriacao: string) {
    const criacao = new Date(dataCriacao);

    if (Number.isNaN(criacao.getTime())) {
      return new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    return new Date(criacao.getTime() + 30 * 60 * 1000).toISOString();
  }

  iniciarCronometroReservas() {
    if (this.cronometroReservas) {
      clearInterval(this.cronometroReservas);
    }

    this.cronometroReservas = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  rolarParaReservaDestacada() {
    if (!this.reservaDestacadaId) {
      return;
    }

    setTimeout(() => {
      const elemento = document.getElementById(`reserva-${this.reservaDestacadaId}`);

      if (elemento) {
        elemento.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 150);
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

  calcularNoites(entrada: string, saida: string) {
    if (!entrada || !saida) return 0;

    const d1 = new Date(`${entrada}T00:00:00`);
    const d2 = new Date(`${saida}T00:00:00`);

    const diff = d2.getTime() - d1.getTime();

    return diff / (1000 * 60 * 60 * 24);
  }

  diasDesdeCriacao(reserva: any): number {
    if (!reserva.dataCriacao) {
      return Infinity;
    }

    const criadaEm = new Date(reserva.dataCriacao).getTime();
    const agora = Date.now();

    const diffMs = agora - criadaEm;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    return diffDias;
  }

  calcularHospedes(reserva: any) {
    return Number(reserva.adultos || 0) + Number(reserva.criancas || 0);
  }

  obterNomeResponsavel(reserva: any) {
    return reserva.responsavelNome || reserva.usuarioNome || this.usuarioLogado.nome || 'Não informado';
  }

  obterEmailResponsavel(reserva: any) {
    return reserva.responsavelEmail || reserva.usuarioEmail || this.usuarioLogado.email || 'Não informado';
  }

  obterPaisResponsavel(reserva: any) {
    return reserva.responsavelPais || 'Não informado';
  }

  obterTipoDocumento(reserva: any) {
    if (reserva.responsavelTipoDocumento === 'cpf') {
      return 'CPF';
    }

    if (reserva.responsavelTipoDocumento === 'passaporte') {
      return 'Passaporte';
    }

    if (reserva.responsavelTipoDocumento === 'outro') {
      return 'Outro documento';
    }

    if (reserva.responsavelCpf) {
      return 'CPF';
    }

    return 'Documento';
  }

  obterDocumento(reserva: any) {
    return reserva.responsavelDocumento || reserva.responsavelCpf || 'Não informado';
  }

  obterTelefone(reserva: any) {
    return reserva.responsavelTelefone || 'Não informado';
  }

  calcularTempoRestantePagamento(reserva: any) {
    if (!reserva.expiraEm) {
      return 0;
    }

    const expiraEm = new Date(reserva.expiraEm).getTime();
    const agora = Date.now();

    const restante = Math.floor((expiraEm - agora) / 1000);

    return Math.max(restante, 0);
  }

  tempoPagamentoFormatado(reserva: any) {
    const restante = this.calcularTempoRestantePagamento(reserva);

    const minutos = Math.floor(restante / 60);
    const segundos = restante % 60;

    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  pagamentoExpirado(reserva: any) {
    return reserva.status === 'pendente' && this.calcularTempoRestantePagamento(reserva) <= 0;
  }

  reservaAguardandoPagamento(reserva: any) {
    return reserva.status === 'pendente' && !this.pagamentoExpirado(reserva);
  }

  reservaConfirmada(reserva: any) {
    return reserva.status === 'pago';
  }

  reservaCancelada(reserva: any) {
    return reserva.status === 'cancelada' || reserva.status === 'cancelado';
  }

  obterStatusVisual(reserva: any) {
    if (this.pagamentoExpirado(reserva)) {
      return 'expirado';
    }

    if (reserva.status === 'pendente') {
      return 'pendente';
    }

    if (reserva.status === 'pago') {
      return 'pago';
    }

    if (this.reservaCancelada(reserva)) {
      return 'cancelada';
    }

    return reserva.status || 'pendente';
  }

  obterTextoStatus(reserva: any) {
    const status = this.obterStatusVisual(reserva);

    if (status === 'pendente') {
      return 'Aguardando pagamento';
    }

    if (status === 'pago') {
      return 'Confirmada';
    }

    if (status === 'expirado') {
      return 'Pagamento expirado';
    }

    if (status === 'cancelada') {
      return 'Cancelada';
    }

    return 'Status indefinido';
  }

  obterMensagemStatus(reserva: any) {
    const status = this.obterStatusVisual(reserva);

    if (status === 'pendente') {
      return 'Sua reserva foi criada e as datas estão reservadas temporariamente. Realize o pagamento dentro do prazo para confirmar.';
    }

    if (status === 'pago') {
      return 'Pagamento confirmado. Sua reserva está confirmada.';
    }

    if (status === 'expirado') {
      return 'O prazo para pagamento terminou. Essa reserva não está mais ativa.';
    }

    if (status === 'cancelada') {
      return 'Esta reserva foi cancelada e não está mais ativa.';
    }

    return 'Status da reserva não identificado.';
  }

  podeCancelarReserva(reserva: any) {
    return this.reservaConfirmada(reserva) && this.diasDesdeCriacao(reserva) <= 7;
  }

  finalizarPeloWhatsapp(reserva: any, tipoPagamento: 'PIX' | 'Cartão') {
    const tipoDocumento = this.obterTipoDocumento(reserva);
    const documento = this.obterDocumento(reserva);

    const mensagem = `Olá Nathália! Gostaria de realizar o pagamento da minha reserva.

Forma de pagamento escolhida: ${tipoPagamento}

Imóvel: ${reserva.titulo}
Entrada: ${this.formatarData(reserva.dataEntrada)}
Saída: ${this.formatarData(reserva.dataSaida)}
Hóspedes: ${this.calcularHospedes(reserva)}
Responsável: ${this.obterNomeResponsavel(reserva)}
E-mail: ${this.obterEmailResponsavel(reserva)}
Telefone: ${this.obterTelefone(reserva)}
País: ${this.obterPaisResponsavel(reserva)}
Documento (${tipoDocumento}): ${documento}
Total: ${this.formatarPreco(reserva.total)}

Tempo restante para pagamento: ${this.tempoPagamentoFormatado(reserva)}`;

const url = `https://wa.me/5513982019760?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }

  cancelarReserva(reservaId: number) {
    const reservaEncontrada = this.reservas.find((reserva) => reserva.id === reservaId);

    if (!reservaEncontrada || !this.podeCancelarReserva(reservaEncontrada)) {
      return;
    }

    const confirmar = confirm('Tem certeza que deseja cancelar esta reserva?');

    if (!confirmar) {
      return;
    }

    if (reservaEncontrada.origem === 'local') {
      this.cancelarReservaLocalStorage(reservaId);
      return;
    }

    alert('O cancelamento dessa reserva será conectado ao backend no próximo passo.');
  }

  cancelarReservaLocalStorage(reservaId: number) {
    const dados = localStorage.getItem('reservas');
    const todasReservas = dados ? JSON.parse(dados) : [];

    const reservasAtualizadas = todasReservas.map((reserva: any) => {
      if (reserva.id === reservaId && reserva.usuarioEmail === this.usuarioLogado.email) {
        return {
          ...reserva,
          status: 'cancelada',
        };
      }

      return reserva;
    });

    localStorage.setItem('reservas', JSON.stringify(reservasAtualizadas));
    this.carregarReservas();
  }

  voltarParaHome() {
    this.router.navigate(['/home']);
  }

  sair() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/login']);
  }
}