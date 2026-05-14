import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  ) {
    this.route.queryParams.subscribe((params) => {
      this.idHospedagem = params['id'] ? Number(params['id']) : null;
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }

  login() {
    const usuarioSalvo = localStorage.getItem('usuario');

    if (!usuarioSalvo) {
      this.erroLogin = 'Nenhum usuário cadastrado';
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    if (this.email === usuario.email && this.senha === usuario.senha) {
      this.erroLogin = '';

      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

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
      return;
    }

    this.erroLogin = 'E-mail ou senha inválidos';
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
