import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

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
  @Input() hospedagem: any;

  reservar() {
    alert('Você reservou: ' + this.titulo);
  }
private router = inject(Router);

  verDetalhes() {
    this.router.navigate(['/detalhes', this.hospedagem.id]);
    console.log('clicou na hospedagem: ', this.hospedagem);
  }


  }
