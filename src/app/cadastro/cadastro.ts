import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase';

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
  confirmarSenha = '';

  aceitouTermos = false;

  erroCadastro = '';

  idHospedagem: number | null = null;
  dataEntrada: string | null = null;
  dataSaida: string | null = null;
  adultos = 0;
  criancas = 0;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.idHospedagem = params['id'] ? Number(params['id']) : null;
      this.dataEntrada = params['dataEntrada'] || null;
      this.dataSaida = params['dataSaida'] || null;
      this.adultos = Number(params['adultos'] || 0);
      this.criancas = Number(params['criancas'] || 0);
    });
  }


  async cadastroGoogle() {
    this.erroCadastro = '';

    try {
      const usuarioGoogle = await this.firebaseService.loginComGoogle();

      const usuario = {
        id: usuarioGoogle.uid,
        nome: usuarioGoogle.displayName,
        email: usuarioGoogle.email,
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


    } catch (erro) {
      console.error('Erro no cadastro com Google:', erro);

      this.erroCadastro =
        'Não foi possível realizar o cadastro com Google.';
    }
  }


  criarCadastro() {
    this.erroCadastro = '';


    if (
      !this.nome ||
      !this.email ||
      !this.senha ||
      !this.confirmarSenha ||
      !this.aceitouTermos
    ) {
      this.erroCadastro =
        'Campos obrigatórios. Preencha todos os campos marcados com *.';

      return;
    }


    if (!this.emailValido(this.email)) {
      this.erroCadastro = 'Digite um e-mail válido.';

      return;
    }


    if (this.senha.length < 6) {
      this.erroCadastro =
        'A senha deve ter pelo menos 6 caracteres.';

      return;
    }


    if (this.senha !== this.confirmarSenha) {
      this.erroCadastro =
        'As senhas não são iguais.';

      return;
    }


    const usuario = {
      id: new Date().getTime(),
      nome: this.nome,
      email: this.email,
      senha: this.senha,
    };


    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify(usuario)
    );


    if (this.idHospedagem) {

      this.router.navigate(
        [`/detalhes/${this.idHospedagem}`],
        {
          queryParams: {
            dataEntrada: this.dataEntrada,
            dataSaida: this.dataSaida,
            adultos: this.adultos,
            criancas: this.criancas,
          },
        }
      );

      return;
    }


    this.router.navigate(['/home']);
  }


  emailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
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