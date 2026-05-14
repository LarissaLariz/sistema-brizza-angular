import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.html',
  styleUrl: './minhas-reservas.css',
})
export class MinhasReservas {

  reservas: any[] = [];

  constructor() {
    const dados = localStorage.getItem('reservas');
    this.reservas = dados ? JSON.parse(dados) : [];
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

  marcarComoPago(index: number) {
    this.reservas[index].status = 'pago';
    localStorage.setItem('reservas', JSON.stringify(this.reservas));
  }

  calcularNoites(entrada: string, saida: string) {
  if (!entrada || !saida) return 0;

  const d1 = new Date(entrada);
  const d2 = new Date(saida);

  const diff = d2.getTime() - d1.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

}