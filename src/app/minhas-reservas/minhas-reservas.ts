import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.html',
  styleUrl: './minhas-reservas.css',
})
export class MinhasReservas {
  usuarioLogado: any = null;
  reservas: any[] = [];
  reservaDestacadaId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const usuario = localStorage.getItem('usuarioLogado');

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogado = JSON.parse(usuario);
    this.carregarReservas();

    const reservaId = this.route.snapshot.queryParamMap.get('reservaId');

    if (reservaId) {
      this.reservaDestacadaId = Number(reservaId);

      setTimeout(() => {
        const elemento = document.getElementById(`reserva-${reservaId}`);

        if (elemento) {
          elemento.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
    }
  }

  carregarReservas() {
    const dados = localStorage.getItem('reservas');
    const todasReservas = dados ? JSON.parse(dados) : [];

    this.reservas = todasReservas.filter(
      (reserva: any) => reserva.usuarioEmail === this.usuarioLogado.email,
    );
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

  calcularDiasDesdeCriacao(dataCriacao: string) {
    if (!dataCriacao) {
      return 999;
    }

    const criacao = new Date(dataCriacao);
    const hoje = new Date();

    criacao.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const diferenca = hoje.getTime() - criacao.getTime();

    return Math.floor(diferenca / (1000 * 60 * 60 * 24));
  }

  podeCancelarReserva(reserva: any) {
    if (reserva.status !== 'pendente') {
      return false;
    }

    if (!reserva.dataCriacao) {
      return false;
    }

    return this.calcularDiasDesdeCriacao(reserva.dataCriacao) <= 7;
  }

  mensagemCancelamento(reserva: any) {
    if (reserva.status !== 'pendente') {
      return '';
    }

    if (!reserva.dataCriacao) {
      return 'Esta reserva foi criada antes da regra de cancelamento.';
    }

    const diasPassados = this.calcularDiasDesdeCriacao(reserva.dataCriacao);
    const diasRestantes = 7 - diasPassados;

    if (diasRestantes < 0) {
      return 'Prazo de cancelamento gratuito encerrado.';
    }

    if (diasRestantes === 0) {
      return 'Último dia para cancelamento gratuito.';
    }

    return `Você ainda tem ${diasRestantes} dia(s) para cancelar gratuitamente.`;
  }

  finalizarPeloWhatsapp(reserva: any) {
    const mensagem = `Olá! Quero realizar o pagamento da minha reserva:

Nome: ${this.usuarioLogado.nome}
E-mail: ${this.usuarioLogado.email}
Imóvel: ${reserva.titulo}
Entrada: ${this.formatarData(reserva.dataEntrada)}
Saída: ${this.formatarData(reserva.dataSaida)}
Hóspedes: ${reserva.adultos + reserva.criancas}
Total: ${this.formatarPreco(reserva.total)}`;

    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  }

  cancelarReserva(reservaId: number) {
    const reservaEncontrada = this.reservas.find((reserva) => reserva.id === reservaId);

    if (!reservaEncontrada || !this.podeCancelarReserva(reservaEncontrada)) {
      return;
    }

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
