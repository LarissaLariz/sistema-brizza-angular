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

  imovelId?: number;
  titulo?: string;
  dataEntrada?: string;
  dataSaida?: string;
  adultos?: number;
  criancas?: number;
  total?: number;
  status?: string;
  dataCriacao?: string;
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
  filtroStatus = 'todas';

  constructor(private router: Router) {}

  ngOnInit() {
    this.carregarReservas();
  }

  carregarReservas() {
    const reservasSalvas = localStorage.getItem('reservas');

    if (reservasSalvas) {
      this.reservas = JSON.parse(reservasSalvas);
    } else {
      this.reservas = [];
    }

    this.reservas.sort((a, b) => {
      const dataA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
      const dataB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;

      return dataB - dataA;
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
    reserva.status = 'pago';
    this.salvarReservas();
  }

  cancelarReserva(reserva: Reserva) {
    const confirmarCancelamento = confirm(
      'Tem certeza que deseja cancelar esta reserva?'
    );

    if (!confirmarCancelamento) {
      return;
    }

    reserva.status = 'cancelada';
    this.salvarReservas();
  }

  salvarReservas() {
    localStorage.setItem('reservas', JSON.stringify(this.reservas));
  }

  contarReservasPorStatus(status: string) {
    return this.reservas.filter((reserva) => reserva.status === status).length;
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
    return (
      reserva.responsavelDocumento ||
      reserva.responsavelCpf ||
      'Documento não informado'
    );
  }

  obterTelefone(reserva: Reserva) {
    return reserva.responsavelTelefone || 'Telefone não informado';
  }
}