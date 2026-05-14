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
  idHospedagem: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.idHospedagem = params['id'] ? Number(params['id']) : null;
    });
  }

  irParaLogin() {
    this.router.navigate(['/login'], {
      queryParams: {
        id: this.idHospedagem
      }
    });
  }

  criarCadastro() {
    const usuario = {
      nome: this.nome,
      email: this.email,
      senha: this.senha
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));

    if (this.idHospedagem) {
this.router.navigate([`/detalhes/${this.idHospedagem}`], {
  queryParams: { abrirModal: true }
});    } else {
      this.router.navigate(['/home']);
    }
  }

}