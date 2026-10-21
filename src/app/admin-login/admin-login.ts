
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  carregando = false;

private apiUrl = 'https://hospeda-guaruja-api.onrender.com/auth/admin-login';

constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  login() {
    this.erro = '';

    if (!this.email.trim() || !this.senha) {
      this.erro = 'Informe seu e-mail e sua senha.';
      return;
    }

    this.carregando = true;

    this.http.post<any>(this.apiUrl, {
      email: this.email.trim(),
      senha: this.senha,
    }).subscribe({
      next: (resposta) => {
        localStorage.setItem('tokenAdmin', resposta.token);
        localStorage.setItem('usuario', JSON.stringify(resposta.usuario));

        this.carregando = false;
        this.router.navigate(['/admin']);
      },
      error: (erro) => {
        this.carregando = false;
        this.erro = erro.error?.erro || 'Não foi possível entrar. Tente novamente.';
      },
    });
  }
}
