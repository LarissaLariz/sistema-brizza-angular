import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-imoveis',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-imoveis.html',
  styleUrl: './admin-imoveis.css',
})
export class AdminImoveis {
  imoveis: any[] = [];

  comodidadesDisponiveis = [
    'Wi-Fi',
    'Piscina',
    'Ar-condicionado',
    'Cozinha',
    'Garagem',
    'TV',
    'Churrasqueira',
    'Elevador'
  ];

  novoImovel = {
    titulo: '',
    local: '',
    descricao: '',
    preco: 0,
    hospedes: 0,
    quartos: 0,
    imagens: [] as string[],
    comodidades: [] as string[]
  };

  constructor() {
    const dados = localStorage.getItem('imoveis');
    this.imoveis = dados ? JSON.parse(dados) : [];
  }

  selecionarImagens(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach((arquivo) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        this.novoImovel.imagens.push(leitor.result as string);
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  alterarComodidade(comodidade: string, event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      this.novoImovel.comodidades.push(comodidade);
    } else {
      this.novoImovel.comodidades = this.novoImovel.comodidades.filter(
        item => item !== comodidade
      );
    }
  }

  adicionarImovel() {
    if (
      !this.novoImovel.titulo ||
      !this.novoImovel.local ||
      !this.novoImovel.descricao ||
      this.novoImovel.preco <= 0 ||
      this.novoImovel.hospedes <= 0 ||
      this.novoImovel.quartos <= 0 ||
      this.novoImovel.imagens.length === 0
    ) {
      return;
    }

    const imovel = {
      id: new Date().getTime(),
      ...this.novoImovel
    };

    this.imoveis.push(imovel);
    localStorage.setItem('imoveis', JSON.stringify(this.imoveis));

    this.novoImovel = {
      titulo: '',
      local: '',
      descricao: '',
      preco: 0,
      hospedes: 0,
      quartos: 0,
      imagens: [],
      comodidades: []
    };
  }

  removerImovel(id: number) {
    this.imoveis = this.imoveis.filter(imovel => imovel.id !== id);
    localStorage.setItem('imoveis', JSON.stringify(this.imoveis));
  }
}