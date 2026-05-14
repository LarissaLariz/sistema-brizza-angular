import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  nome = '';
  email = '';
  senha = '';
  erroCadastro = '';

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

  criarCadastro() {
    this.erroCadastro = '';

    if (!this.nome || !this.email || !this.senha) {
      this.erroCadastro = 'Preencha nome, e-mail e senha.';
      return;
    }

    const usuario = {
      id: new Date().getTime(),
      nome: this.nome,
      email: this.email,
      senha: this.senha,
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));
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
  }

  irParaLogin() {
    this.router.navigate(['/login'], {
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
