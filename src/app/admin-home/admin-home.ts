import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome {

  constructor(private router: Router) {}

  irParaImoveis() {
    this.router.navigate(['/admin/imoveis']);
  }

  irParaReservas() {
    this.router.navigate(['/admin/reservas']);
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/admin-login']);
  }

}