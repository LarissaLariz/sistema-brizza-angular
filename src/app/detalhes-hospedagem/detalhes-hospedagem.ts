import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalhes-hospedagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-hospedagem.html',
  styleUrl: './detalhes-hospedagem.css',
})
export class DetalhesHospedagem {
  hospedagemSelecionada: any = null;
  id: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.id = Number(idParam);
    }

    this.hospedagemSelecionada = {
      titulo: 'Golden Beach 158',
      descricao:
        'Hospedagem confortável no Guarujá, com piscina, boa localização e vista agradável.',
      imagem: '/images/imagem1.jpeg',
    };
  }

  Voltar() {
    this.router.navigate(['/home']);
  }
}