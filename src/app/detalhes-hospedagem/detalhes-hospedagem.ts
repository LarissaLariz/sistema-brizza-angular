import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalhes-hospedagem',
  standalone: true,
  imports: [],
  templateUrl: './detalhes-hospedagem.html',
  styleUrl: './detalhes-hospedagem.css',
})
export class DetalhesHospedagem implements OnInit {
  private route = inject(ActivatedRoute);
  id: number | null = null;

  ngOnInit() {
    const idRecebido = this.route.snapshot.paramMap.get('id');
    this.id = Number(idRecebido);
    console.log('ID recebido:', this.id);
  }
}
