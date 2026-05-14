import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  email = '';
  senha = '';
  erro = '';

  constructor(private router: Router) {}

  login() {
    if (this.email === 'admin@brizza.com' && this.senha === '123456') {

      const usuario = {
        email: this.email,
        tipo: 'admin'
      };

      localStorage.setItem('usuario', JSON.stringify(usuario));

      this.router.navigate(['/admin']);

    } else {
      this.erro = 'Login inválido';
    }
  }

}