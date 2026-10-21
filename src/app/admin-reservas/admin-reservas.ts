import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Imoveis } from '../services/imoveis';

interface Reserva {
  id?: number;
  usuarioEmail?: string;
  usuarioNome?: string;
  responsavelNome?: string;
  responsavelEmail?: string;
  responsavelPais?: string;
  responsavelTipoDocumento?: string;
  responsavelDocumento?: string;
  responsavelCpf?: string;
  responsavelTelefone?: string;
  hospedesAdicionais?: any[];
  imovelId?: number | string;
  titulo?: string;
  dataEntrada?: string;
  dataSaida?: string;
  adultos?: number;
  criancas?: number;
  total?: number;
  status?: string;
  dataCriacao?: string;
}

interface BloqueioData {
  id: number;
  imovelId: number | string;
  titulo: string;
  dataEntrada: string;
  dataSaida: string;
  motivo: string;
  dataCriacao: string;
}

interface ImovelOpcao {
  id: number | string;
  titulo: string;
}

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservas.html',
  styleUrl: './admin-reservas.css',
})
export class AdminReservas implements OnInit {
  reservas: Reserva[] = [];
  bloqueiosDatas: BloqueioData[] = [];
  imoveisDisponiveis: ImovelOpcao[] = [];

  filtroStatus = 'todas';

  bloqueioImovelId: number | string | null = null;
  bloqueioDataEntrada = '';
  bloqueioDataSaida = '';
  bloqueioMotivo = '';

  mensagemBloqueio = '';
  erroBloqueio = '';

  dataHoje = '';
  carregandoReservas = false;
  erroReservas = '';
  carregandoBloqueios = false;
  salvandoBloqueio = false;

  constructor(
    private router: Router,
    private imoveisService: Imoveis,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.dataHoje = this.gerarDataHoje();
    this.carregarReservas();
    this.carregarBloqueiosDatas();
    this.carregarImoveisDisponiveis();
  }

  private tratarErroAutenticacao(erro: any): boolean {
    if (erro.status !== 401 && erro.status !== 403) {
      return false;
    }

    localStorage.removeItem('tokenAdmin');
    localStorage.removeItem('usuario');
    this.router.navigate(['/admin-login']);

    return true;
  }

  carregarReservas() {
    this.carregandoReservas = true;
    this.erroReservas = '';

    this.imoveisService.listarReservas().subscribe({
      next: (resposta: any[]) => {
        this.reservas = resposta.map((item) => this.normalizarReserva(item));

        this.reservas.sort((a, b) => {
          const dataA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
          const dataB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
          return dataB - dataA;
        });

        this.carregandoReservas = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.carregandoReservas = false;
        this.cdr.markForCheck();

        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        this.erroReservas = 'Não foi possível carregar as reservas do servidor.';
        alert(this.erroReservas);
      },
    });
  }

  private normalizarReserva(item: any): Reserva {
    return {
      id: item.id,
      usuarioEmail: item.usuarioEmail ?? item.usuario_email,
      usuarioNome: item.usuarioNome ?? item.usuario_nome,
      responsavelNome: item.responsavelNome ?? item.responsavel_nome,
      responsavelEmail: item.responsavelEmail ?? item.responsavel_email,
      responsavelPais: item.responsavelPais ?? item.responsavel_pais,
      responsavelTipoDocumento:
        item.responsavelTipoDocumento ?? item.responsavel_tipo_documento,
      responsavelDocumento: item.responsavelDocumento ?? item.responsavel_documento,
      responsavelCpf: item.responsavelCpf ?? item.responsavel_cpf,
      responsavelTelefone: item.responsavelTelefone ?? item.responsavel_telefone,
      hospedesAdicionais: item.hospedesAdicionais ?? item.hospedes_adicionais ?? [],
      imovelId: item.imovelId ?? item.imovel_id,
      titulo: item.titulo ?? item.titulo_imovel,
      dataEntrada: this.normalizarData(item.dataEntrada ?? item.data_entrada),
      dataSaida: this.normalizarData(item.dataSaida ?? item.data_saida),
      adultos: Number(item.adultos ?? 0),
      criancas: Number(item.criancas ?? 0),
      total: Number(item.total ?? 0),
      status: item.status,
      dataCriacao: item.dataCriacao ?? item.criado_em,
    };
  }

  private normalizarData(data?: string | null): string | undefined {
    if (!data) {
      return undefined;
    }

    return data.substring(0, 10);
  }

  carregarBloqueiosDatas() {
    this.carregandoBloqueios = true;
    this.erroBloqueio = '';

    this.imoveisService.listarBloqueios().subscribe({
      next: (resposta: any[]) => {
        this.bloqueiosDatas = resposta.map((item) => {
          const imovelId = item.imovelId ?? item.imovel_id;
          const imovel = this.imoveisDisponiveis.find(
            (opcao) => String(opcao.id) === String(imovelId),
          );

          return {
            id: Number(item.id),
            imovelId,
            titulo: item.titulo ?? item.titulo_imovel ?? imovel?.titulo ?? `Imóvel ${imovelId}`,
            dataEntrada: this.normalizarData(item.dataEntrada ?? item.data_entrada) || '',
            dataSaida: this.normalizarData(item.dataSaida ?? item.data_saida) || '',
            motivo: item.motivo || '',
            dataCriacao: item.dataCriacao ?? item.criado_em ?? '',
          };
        });

        this.ordenarBloqueios();
        this.carregandoBloqueios = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.carregandoBloqueios = false;
        this.cdr.markForCheck();

        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        this.erroBloqueio = erro.error?.erro || 'Não foi possível carregar os bloqueios do servidor.';
      },
    });
  }

  private ordenarBloqueios() {
    this.bloqueiosDatas.sort((a, b) => {
      const dataA = a.dataEntrada ? new Date(a.dataEntrada + 'T00:00:00').getTime() : 0;
      const dataB = b.dataEntrada ? new Date(b.dataEntrada + 'T00:00:00').getTime() : 0;
      return dataA - dataB;
    });
  }

  carregarImoveisDisponiveis() {
    this.imoveisService.listarImoveis().subscribe({
      next: (resposta: any[]) => {
        this.imoveisDisponiveis = resposta
          .filter((item) => item.id != null)
          .map((item) => ({
            id: item.id,
            titulo: item.titulo ?? item.nome ?? `Imóvel ${item.id}`,
          }));

        this.bloqueiosDatas = this.bloqueiosDatas.map((bloqueio) => {
          const imovel = this.imoveisDisponiveis.find(
            (item) => String(item.id) === String(bloqueio.imovelId),
          );

          return {
            ...bloqueio,
            titulo: imovel?.titulo ?? bloqueio.titulo,
          };
        });

        this.cdr.markForCheck();
      },
      error: (erro) => {
        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        console.error('Não foi possível carregar os imóveis.', erro);
      },
    });
  }

  get reservasFiltradas() {
    if (this.filtroStatus === 'todas') {
      return this.reservas;
    }

    return this.reservas.filter((reserva) => reserva.status === this.filtroStatus);
  }

  voltarParaPainel() {
    this.router.navigate(['/admin']);
  }

  marcarComoPaga(reserva: Reserva) {
    if (!reserva.id || reserva.status === 'pago') {
      return;
    }

    this.imoveisService.atualizarStatusReserva(reserva.id, 'pago').subscribe({
      next: (resposta) => {
        reserva.status = resposta.status;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        alert(erro.error?.erro || 'Não foi possível atualizar o pagamento da reserva.');
      },
    });
  }

  cancelarReserva(reserva: Reserva) {
    const confirmarCancelamento = confirm(
      'Tem certeza que deseja cancelar esta reserva?',
    );

    if (!confirmarCancelamento || !reserva.id) {
      return;
    }

    this.imoveisService.atualizarStatusReserva(reserva.id, 'cancelada').subscribe({
      next: (resposta) => {
        reserva.status = resposta.status;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        alert(erro.error?.erro || 'Não foi possível cancelar a reserva.');
      },
    });
  }

  contarReservasPorStatus(status: string) {
    return this.reservas.filter((reserva) => reserva.status === status).length;
  }

  gerarDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(data?: string) {
    if (!data) {
      return 'Data não informada';
    }

    return new Date(data.substring(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  formatarTotal(valor?: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  }

  calcularHospedes(reserva: Reserva) {
    return Number(reserva.adultos || 0) + Number(reserva.criancas || 0);
  }

  obterNomeResponsavel(reserva: Reserva) {
    return reserva.responsavelNome || reserva.usuarioNome || 'Responsável não informado';
  }

  obterEmailResponsavel(reserva: Reserva) {
    return reserva.responsavelEmail || reserva.usuarioEmail || 'E-mail não informado';
  }

  obterPaisResponsavel(reserva: Reserva) {
    return reserva.responsavelPais || 'País não informado';
  }

  obterTipoDocumento(reserva: Reserva) {
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

    return 'Documento não informado';
  }

  obterDocumento(reserva: Reserva) {
    return reserva.responsavelDocumento || reserva.responsavelCpf || 'Documento não informado';
  }

  obterTelefone(reserva: Reserva) {
    return reserva.responsavelTelefone || 'Telefone não informado';
  }

  obterTituloImovelSelecionado() {
    const imovel = this.imoveisDisponiveis.find(
      (item) => String(item.id) === String(this.bloqueioImovelId),
    );

    return imovel?.titulo || '';
  }

  datasConflitam(
    entradaNova: Date,
    saidaNova: Date,
    entradaExistente: Date,
    saidaExistente: Date,
  ) {
    return entradaNova < saidaExistente && saidaNova > entradaExistente;
  }

  buscarConflitoParaBloqueioManual() {
    if (!this.bloqueioImovelId || !this.bloqueioDataEntrada || !this.bloqueioDataSaida) {
      return null;
    }

    const entradaNova = new Date(this.bloqueioDataEntrada + 'T00:00:00');
    const saidaNova = new Date(this.bloqueioDataSaida + 'T00:00:00');

    const reservaConflitante = this.reservas.find((reserva) => {
      const mesmaHospedagem =
        String(reserva.imovelId) === String(this.bloqueioImovelId);

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

      const entradaExistente = new Date(reserva.dataEntrada + 'T00:00:00');
      const saidaExistente = new Date(reserva.dataSaida + 'T00:00:00');

      return this.datasConflitam(
        entradaNova,
        saidaNova,
        entradaExistente,
        saidaExistente,
      );
    });

    if (reservaConflitante) {
      return {
        tipo: 'reserva',
        status: reservaConflitante.status || 'pendente',
        dataEntrada: reservaConflitante.dataEntrada,
        dataSaida: reservaConflitante.dataSaida,
      };
    }

    const bloqueioConflitante = this.bloqueiosDatas.find((bloqueio) => {
      const mesmaHospedagem =
        String(bloqueio.imovelId) === String(this.bloqueioImovelId);

      if (!mesmaHospedagem || !bloqueio.dataEntrada || !bloqueio.dataSaida) {
        return false;
      }

      const entradaExistente = new Date(bloqueio.dataEntrada + 'T00:00:00');
      const saidaExistente = new Date(bloqueio.dataSaida + 'T00:00:00');

      return this.datasConflitam(
        entradaNova,
        saidaNova,
        entradaExistente,
        saidaExistente,
      );
    });

    if (bloqueioConflitante) {
      return {
        tipo: 'bloqueio',
        motivo: bloqueioConflitante.motivo,
        dataEntrada: bloqueioConflitante.dataEntrada,
        dataSaida: bloqueioConflitante.dataSaida,
      };
    }

    return null;
  }

  montarMensagemConflito(conflito: any) {
    if (conflito.tipo === 'reserva') {
      return `Esse período cruza com uma reserva ${conflito.status} de ${this.formatarData(
        conflito.dataEntrada,
      )} até ${this.formatarData(conflito.dataSaida)}.`;
    }

    return `Esse período cruza com um bloqueio manual de ${this.formatarData(
      conflito.dataEntrada,
    )} até ${this.formatarData(conflito.dataSaida)}.`;
  }

  bloquearPeriodoManual() {
    this.erroBloqueio = '';
    this.mensagemBloqueio = '';

    if (this.salvandoBloqueio) {
      return;
    }

    if (!this.bloqueioImovelId) {
      this.erroBloqueio = 'Selecione o imóvel que deseja bloquear.';
      return;
    }

    if (!this.bloqueioDataEntrada || !this.bloqueioDataSaida) {
      this.erroBloqueio = 'Informe a data inicial e a data final do bloqueio.';
      return;
    }

    const entrada = new Date(this.bloqueioDataEntrada + 'T00:00:00');
    const saida = new Date(this.bloqueioDataSaida + 'T00:00:00');
    const hoje = new Date(this.dataHoje + 'T00:00:00');

    if (entrada < hoje) {
      this.erroBloqueio = 'A data inicial não pode ser anterior à data atual.';
      return;
    }

    if (saida <= entrada) {
      this.erroBloqueio = 'A data final deve ser depois da data inicial.';
      return;
    }

    if (!this.bloqueioMotivo.trim()) {
      this.erroBloqueio = 'Informe o motivo do bloqueio.';
      return;
    }

    const conflito = this.buscarConflitoParaBloqueioManual();

    if (conflito) {
      this.erroBloqueio = this.montarMensagemConflito(conflito);
      return;
    }

    this.salvandoBloqueio = true;

    this.imoveisService.criarBloqueio({
      imovelId: Number(this.bloqueioImovelId),
      dataEntrada: this.bloqueioDataEntrada,
      dataSaida: this.bloqueioDataSaida,
      motivo: this.bloqueioMotivo.trim(),
    }).subscribe({
      next: (resposta: any) => {
        const imovelId = resposta.imovelId ?? resposta.imovel_id ?? this.bloqueioImovelId;
        const imovel = this.imoveisDisponiveis.find(
          (item) => String(item.id) === String(imovelId),
        );

        this.bloqueiosDatas.push({
          id: Number(resposta.id),
          imovelId,
          titulo: imovel?.titulo || this.obterTituloImovelSelecionado(),
          dataEntrada: this.normalizarData(resposta.dataEntrada ?? resposta.data_entrada) || this.bloqueioDataEntrada,
          dataSaida: this.normalizarData(resposta.dataSaida ?? resposta.data_saida) || this.bloqueioDataSaida,
          motivo: resposta.motivo || this.bloqueioMotivo.trim(),
          dataCriacao: resposta.dataCriacao ?? resposta.criado_em ?? new Date().toISOString(),
        });

        this.ordenarBloqueios();

        this.bloqueioImovelId = null;
        this.bloqueioDataEntrada = '';
        this.bloqueioDataSaida = '';
        this.bloqueioMotivo = '';

        this.mensagemBloqueio = 'Período bloqueado com sucesso.';
        this.salvandoBloqueio = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.salvandoBloqueio = false;
        this.cdr.markForCheck();

        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        this.erroBloqueio =
          erro.error?.erro || 'Não foi possível salvar o bloqueio no banco de dados.';
      },
    });
  }

  removerBloqueio(bloqueio: BloqueioData) {
    const confirmarRemocao = confirm('Tem certeza que deseja remover este bloqueio?');

    if (!confirmarRemocao) {
      return;
    }

    this.erroBloqueio = '';
    this.mensagemBloqueio = '';

    this.imoveisService.removerBloqueio(bloqueio.id).subscribe({
      next: () => {
        this.bloqueiosDatas = this.bloqueiosDatas.filter(
          (item) => item.id !== bloqueio.id,
        );

        this.mensagemBloqueio = 'Bloqueio removido com sucesso.';
        this.cdr.markForCheck();
      },
      error: (erro) => {
        if (this.tratarErroAutenticacao(erro)) {
          return;
        }

        this.erroBloqueio =
          erro.error?.erro || 'Não foi possível remover o bloqueio do banco de dados.';
      },
    });
  }
}