import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HOSPEDAGENS } from '../dados/hospedagens';

@Component({
  selector: 'app-detalhes-hospedagem',
  standalone: true,
  imports: [NgIf],
  templateUrl: './detalhes-hospedagem.html',
  styleUrl: './detalhes-hospedagem.css',
})
export class DetalhesHospedagem implements OnInit {
  private route = inject(ActivatedRoute);
  
  hospedagemSelecionada: any = null;
  Voltar() {
    this.route.navigate(['/home']);}
  id: number | null = null;

  ngOnInit() {
    const idRecebido = this.route.snapshot.paramMap.get('id');
    this.id = Number(idRecebido);
    this.hospedagemSelecionada = HOSPEDAGENS.find((hospedagem) => hospedagem.id === this.id);
    console.log('ID recebido:', this.id);
  }
}
