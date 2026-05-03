import { Component, HostListener } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospedagemCard } from '../hospedagem-card/hospedagem-card';
import { HOSPEDAGENS } from '../dados/hospedagens';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, HospedagemCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  hospedagens = HOSPEDAGENS;

  // CONTROLES DE UI
  mostrarHospedes = false;
  mostrarCalendario = false;
  mostrarSugestoesLocal = false;

  // HÓSPEDES
  adultos = 0;
  criancas = 0;

  // LOCAL
  localSelecionado = '';

  lugaresGuaruja = [
    'Pitangueiras',
    'Enseada',
    'Astúrias',
    'Tombo',
    'Pernambuco',
    'Guaiúba',
    'Praia do Éden',
    'Sorocotuba',
    'Centro',
    'Jardim Tejereba',
    'Balneário Praia do Pernambuco',
    'Vila Júlia',
  ];

  // CALENDÁRIO
  diasAbril = Array.from({ length: 30 }, (_, i) => i + 1);
  diasMaio = Array.from({ length: 31 }, (_, i) => i + 1);

  dataEntrada: string | null = null;
  dataSaida: string | null = null;

  get lugaresFiltrados() {
    const texto = this.localSelecionado.toLowerCase().trim();

    if (!texto) {
      return this.lugaresGuaruja;
    }

    return this.lugaresGuaruja.filter((lugar) =>
      lugar.toLowerCase().includes(texto)
    );
  }

  selecionarLocal(local: string) {
    this.localSelecionado = local;
    this.mostrarSugestoesLocal = false;
  }

  alterarQuantidade(tipo: 'adultos' | 'criancas', valor: number) {
    const total = this.adultos + this.criancas;

    if (valor > 0 && total >= 6) return;

    if (tipo === 'adultos') {
      this.adultos = Math.max(0, this.adultos + valor);
    }

    if (tipo === 'criancas') {
      this.criancas = Math.max(0, this.criancas + valor);
    }
  }

  selecionarData(data: string) {
    if (this.dataEntrada === null || this.dataSaida !== null) {
      this.dataEntrada = data;
      this.dataSaida = null;
      return;
    }

    if (data < this.dataEntrada) {
      this.dataSaida = this.dataEntrada;
      this.dataEntrada = data;
      return;
    }

    this.dataSaida = data;
  }

  @HostListener('document:click', ['$event'])
  fecharDropdowns(event: Event) {
    const el = event.target as HTMLElement;

    if (!el.closest('.guests-segment') && !el.closest('.guests-dropdown')) {
      this.mostrarHospedes = false;
    }

    if (!el.closest('.dates-segment') && !el.closest('.calendar-dropdown')) {
      this.mostrarCalendario = false;
    }

    if (!el.closest('.location-segment') && !el.closest('.location-dropdown')) {
      this.mostrarSugestoesLocal = false;
    }
  }
}