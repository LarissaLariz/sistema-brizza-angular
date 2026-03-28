import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { HospedagemCard } from './hospedagem-card/hospedagem-card';
import { Login } from './login/login';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
