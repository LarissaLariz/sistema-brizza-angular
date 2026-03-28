import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { HospedagemCard } from '../hospedagem-card/hospedagem-card';
import { HOSPEDAGENS } from '../dados/hospedagens';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, HospedagemCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  hospedagens = HOSPEDAGENS;
}
