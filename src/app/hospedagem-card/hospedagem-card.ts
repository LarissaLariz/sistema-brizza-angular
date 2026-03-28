import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hospedagem-card',
  standalone: true,
  templateUrl: './hospedagem-card.html',
  styleUrl: './hospedagem-card.css',
})
export class HospedagemCard {
  @Input() titulo!: string;
  @Input() descricao!: string;
  @Input() imagem!: string;

  reservar() {
    alert('Você reservou: ' + this.titulo);
  }
}
