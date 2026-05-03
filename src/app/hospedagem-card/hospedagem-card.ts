import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hospedagem-card',
  standalone: true,
  imports: [],
  templateUrl: './hospedagem-card.html',
  styleUrl: './hospedagem-card.css',
})
export class HospedagemCard {
  @Input() titulo = '';
  @Input() descricao = '';
  @Input() imagem = '';
  @Input() hospedagem: any;

  constructor(private router: Router) {}

  reservar() {
    alert('Reserva iniciada!');
  }

  verDetalhes() {
    this.router.navigate(['/detalhes', this.hospedagem.id]);
  }
}