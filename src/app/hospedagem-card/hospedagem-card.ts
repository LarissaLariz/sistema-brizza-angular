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

  @Input() dataEntrada: string | null = null;
  @Input() dataSaida: string | null = null;
  @Input() adultos = 0;
  @Input() criancas = 0;

  constructor(private router: Router) {}

 reservar() {
  this.verDetalhes();
}

  verDetalhes() {
    this.router.navigate(['/detalhes', this.hospedagem.id], {
      queryParams: {
        dataEntrada: this.dataEntrada,
        dataSaida: this.dataSaida,
        adultos: this.adultos,
        criancas: this.criancas,
      },
    });
  }
}