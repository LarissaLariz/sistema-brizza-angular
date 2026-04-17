import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HOSPEDAGENS } from '../dados/hospedagens';

@Component({
  selector: 'app-detalhes-hospedagem',
  standalone: true,
  private Router = inject(ActivatedRoute),
  private Router = inject(Router),
  
  hospedagemSelecionada: any = null;
  Voltar() {
    this.router.navigate(['/home']);}
  id: number | null = null;

  ngOnInit() {
    const idRecebido = this.route.snapshot.paramMap.get('id');
    this.id = Number(idRecebido);
    this.hospedagemSelecionada = HOSPEDAGENS.find((hospedagem) => hospedagem.id === this.id);
    console.log('ID recebido:', this.id);
  }
}
