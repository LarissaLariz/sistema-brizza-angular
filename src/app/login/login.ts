import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email: string = '';
  senha: string = '';
  erroLogin: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService) {}

  fazerLogin() {
  this.loginService.login(this.email, this.senha).subscribe({
    next: (res) => {
      console.log('Resposta do backend:', res);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      console.error('Erro no login:', err);
      this.erroLogin = 'Email ou senha incorretos. Por favor, tente novamente.';
    }    
  });
}}