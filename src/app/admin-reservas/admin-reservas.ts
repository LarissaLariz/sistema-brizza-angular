import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  hospedagensFixas: ImovelOpcao[] = [
    { id: 1, titulo: 'Golden Beach 158' },
    { id: 2, titulo: 'Loft no centro' },
    { id: 3, titulo: 'Loft na serra' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.dataHoje = this.gerarDataHoje();

    this.carregarReservas();
    this.carregarBloqueiosDatas();
    this.carregarImoveisDisponiveis();
  }

  carregarReservas() {
    const reservasSalvas = localStorage.getItem('reservas');

    try {
      this.reservas = reservasSalvas ? JSON.parse(reservasSalvas) : [];
    } catch {
      this.reservas = [];
    }

    this.reservas.sort((a, b) => {
      const dataA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
      const dataB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;

      return dataB - dataA;
    });
  }

  carregarBloqueiosDatas() {
    const bloqueiosSalvos = localStorage.getItem('bloqueiosDatas');

    try {
      this.bloqueiosDatas = bloqueiosSalvos ? JSON.parse(bloqueiosSalvos) : [];
    } catch {
      this.bloqueiosDatas = [];
    }

    this.bloqueiosDatas.sort((a, b) => {
      const dataA = a.dataEntrada ? new Date(a.dataEntrada + 'T00:00:00').getTime() : 0;
      const dataB = b.dataEntrada ? new Date(b.dataEntrada + 'T00:00:00').getTime() : 0;

      return dataA - dataB;
    });
  }

  carregarImoveisDisponiveis() {
    const mapaImoveis = new Map<string, ImovelOpcao>();

    this.hospedagensFixas.forEach((imovel) => {
      mapaImoveis.set(String(imovel.id), imovel);
    });

    const imoveisSalvos = localStorage.getItem('imoveis');

    if (imoveisSalvos) {
      try {
        const imoveisAdmin = JSON.parse(imoveisSalvos);

        imoveisAdmin.forEach((imovel: any) => {
          if (imovel.id && imovel.titulo) {
            mapaImoveis.set(String(imovel.id), {
              id: imovel.id,
              titulo: imovel.titulo,
            });
          }
        });
      } catch {
        return;
      }
    }

    this.imoveisDisponiveis = Array.from(mapaImoveis.values());
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
    reserva.status = 'pago';
    this.salvarReservas();
  }

  cancelarReserva(reserva: Reserva) {
    const confirmarCancelamento = confirm('Tem certeza que deseja cancelar esta reserva?');

    if (!confirmarCancelamento) {
      return;
    }

    reserva.status = 'cancelada';
    this.salvarReservas();
  }

  salvarReservas() {
    localStorage.setItem('reservas', JSON.stringify(this.reservas));
  }

  salvarBloqueiosDatas() {
    localStorage.setItem('bloqueiosDatas', JSON.stringify(this.bloqueiosDatas));
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

    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
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
      (item) => String(item.id) === String(this.bloqueioImovelId)
    );

    return imovel?.titulo || '';
  }

  datasConflitam(
    entradaNova: Date,
    saidaNova: Date,
    entradaExistente: Date,
    saidaExistente: Date
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
        saidaExistente
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
        saidaExistente
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
        conflito.dataEntrada
      )} até ${this.formatarData(conflito.dataSaida)}.`;
    }

    return `Esse período cruza com um bloqueio manual de ${this.formatarData(
      conflito.dataEntrada
    )} até ${this.formatarData(conflito.dataSaida)}.`;
  }

  bloquearPeriodoManual() {
    this.erroBloqueio = '';
    this.mensagemBloqueio = '';

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

    const novoBloqueio: BloqueioData = {
      id: new Date().getTime(),
      imovelId: this.bloqueioImovelId,
      titulo: this.obterTituloImovelSelecionado(),
      dataEntrada: this.bloqueioDataEntrada,
      dataSaida: this.bloqueioDataSaida,
      motivo: this.bloqueioMotivo.trim(),
      dataCriacao: new Date().toISOString(),
    };

    this.bloqueiosDatas.push(novoBloqueio);
    this.salvarBloqueiosDatas();
    this.carregarBloqueiosDatas();

    this.bloqueioImovelId = null;
    this.bloqueioDataEntrada = '';
    this.bloqueioDataSaida = '';
    this.bloqueioMotivo = '';

    this.mensagemBloqueio = 'Período bloqueado com sucesso.';
  }

  removerBloqueio(bloqueio: BloqueioData) {
    const confirmarRemocao = confirm('Tem certeza que deseja remover este bloqueio?');

    if (!confirmarRemocao) {
      return;
    }

    this.bloqueiosDatas = this.bloqueiosDatas.filter((item) => item.id !== bloqueio.id);
    this.salvarBloqueiosDatas();

    this.mensagemBloqueio = 'Bloqueio removido com sucesso.';
    this.erroBloqueio = '';
  }
}