import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { HospedagemCard } from './hospedagem-card/hospedagem-card';
import { Login } from './login/login';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NgFor, HospedagemCard, Login, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('hospedagens');

  hospedagens = [
    {
      titulo: 'Loft na praia',
      descricao: 'Vista para o mar',
      imagem: '/images/imagem1.jpeg',
    },
    {
      titulo: 'Loft no centro',
      descricao: 'Vista para a cidade',
      imagem: '/images/imagem2.jpeg',
    },
    {
      titulo: 'Loft na serra',
      descricao: 'Vista para a montanha',
      imagem: '/images/imagem3.jpeg',
    },
  ];
}
