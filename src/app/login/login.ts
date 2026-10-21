import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  senha = '';
  erroLogin = '';

  idHospedagem: number | null = null;
  dataEntrada: string | null = null;
  dataSaida: string | null = null;
  adultos = 0;
  criancas = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.idHospedagem = params['id'] ? Number(params['id']) : null;
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }

  async loginGoogle() {
    try {
      const usuario = await this.firebaseService.loginComGoogle();

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify({ nome: usuario.displayName || '', email: usuario.email || '' })
      );

      this.redirecionarAposLogin();
    } catch (error) {
      this.erroLogin = 'Não foi possível entrar com Google.';
      console.error(error);
    }
  }

  async login() {
    try {
      const usuario = await this.firebaseService.loginComEmail(this.email, this.senha);

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify({ nome: usuario.displayName || '', email: usuario.email || '' })
      );

      this.erroLogin = '';
      this.redirecionarAposLogin();
    } catch (error) {
      this.erroLogin = 'E-mail ou senha inválidos';
      console.error(error);
    }
  }

  redirecionarAposLogin() {
    if (this.idHospedagem) {
      this.router.navigate([`/detalhes/${this.idHospedagem}`], {
        queryParams: {
          dataEntrada: this.dataEntrada,
          dataSaida: this.dataSaida,
          adultos: this.adultos,
          criancas: this.criancas,
        },
      });
      return;
    }

    this.router.navigate(['/home']);
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro'], {
      queryParams: {
        id: this.idHospedagem,
        dataEntrada: this.dataEntrada,
        dataSaida: this.dataSaida,
        adultos: this.adultos,
        criancas: this.criancas,
      },
    });
  }
}