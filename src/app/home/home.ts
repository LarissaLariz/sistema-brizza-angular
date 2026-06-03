import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HospedagemCard } from '../hospedagem-card/hospedagem-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, HospedagemCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @ViewChild('lista', { static: false }) lista!: ElementRef;

  usuarioLogado: any = null;

  localSelecionado = '';
  mostrarSugestoesLocal = false;
  mostrarCalendario = false;
  mostrarHospedes = false;

  adultos = 0;
  criancas = 0;

  dataEntrada: string | null = null;
  dataSaida: string | null = null;

  hoje = new Date();

  mesAtualCalendario = this.criarMesCalendario(this.hoje.getFullYear(), this.hoje.getMonth());

  proximoMesCalendario = this.criarMesCalendario(this.hoje.getFullYear(), this.hoje.getMonth() + 1);

  lugares = ['Pitangueiras', 'Enseada', 'Astúrias', 'Tombo', 'Guaiúba', 'Centro'];

  hospedagens: any[] = [
    {
      id: 1,
      titulo: 'Golden Beach 158',
      local: 'Pitangueiras',
      descricao: 'No Guarujá, bem no coração da cidade',
      imagem: '/images/imagem1.jpeg',
      imagens: ['/images/imagem1.jpeg', '/images/imagem2.jpeg', '/images/imagem3.jpeg'],
      preco: 200,
    },
    {
      id: 2,
      titulo: 'Loft no centro',
      local: 'Tombo',
      descricao: 'Vista para a cidade',
      imagem: '/images/imagem2.jpeg',
      imagens: ['/images/imagem2.jpeg', '/images/imagem1.jpeg', '/images/imagem3.jpeg'],
      preco: 180,
    },
    {
      id: 3,
      titulo: 'Loft na serra',
      local: 'Astúrias',
      descricao: 'Vista para a montanha',
      imagem: '/images/imagem3.jpeg',
      imagens: ['/images/imagem3.jpeg', '/images/imagem1.jpeg', '/images/imagem2.jpeg'],
      preco: 220,
    },
  ];

  hospedagensFiltradas: any[] = [];

  constructor(private router: Router) {
    const usuario = localStorage.getItem('usuarioLogado');
    this.usuarioLogado = usuario ? JSON.parse(usuario) : null;

    this.carregarImoveisDoAdmin();
  }

  carregarImoveisDoAdmin() {
    const dados = localStorage.getItem('imoveis');

    if (!dados) {
      this.hospedagensFiltradas = [...this.hospedagens];
      return;
    }

    try {
      const imoveisAdmin = JSON.parse(dados);

      const mapa = new Map<number, any>();

      this.hospedagens.forEach((imovel) => {
        mapa.set(imovel.id, imovel);
      });

      imoveisAdmin.forEach((imovel: any) => {
        mapa.set(imovel.id, {
          ...imovel,
          imagem: imovel.imagens?.[0] || '',
        });
      });

      this.hospedagens = Array.from(mapa.values());

      this.hospedagensFiltradas = [...this.hospedagens];
    } catch {
      this.hospedagensFiltradas = [...this.hospedagens];
    }
  }

  criarMesCalendario(ano: number, mes: number) {
    const primeiroDiaDoMes = new Date(ano, mes, 1);
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0);

    const nomeMes = primeiroDiaDoMes.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    const espacosAntes = primeiroDiaDoMes.getDay();
    const quantidadeDias = ultimoDiaDoMes.getDate();

    const dias = Array.from({ length: quantidadeDias }, (_, indice) => {
      const dia = indice + 1;
      const data = new Date(ano, mes, dia);

      return {
        dia,
        dataCompleta: this.formatarDataParaInput(data),
      };
    });

    return {
      nomeMes,
      espacosAntes: Array.from({ length: espacosAntes }),
      dias,
    };
  }

  formatarDataParaInput(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  get lugaresFiltrados() {
    return this.lugares.filter((lugar) =>
      lugar.toLowerCase().includes(this.localSelecionado.toLowerCase()),
    );
  }

  aplicarDatas() {
    this.mostrarCalendario = false;
  }

  get textoDatas() {
    if (this.dataEntrada && this.dataSaida) {
      return `${this.formatarData(this.dataEntrada)} - ${this.formatarData(this.dataSaida)}`;
    }

    if (this.dataEntrada) {
      return this.formatarData(this.dataEntrada);
    }

    return 'Insira as datas';
  }

  get textoHospedes() {
    const total = this.adultos + this.criancas;

    if (total === 0) {
      return 'Hóspedes?';
    }

    return `${total} hóspede(s)`;
  }

  formatarData(data: string) {
    const [ano, mes, dia] = data.split('-');

    const meses = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];

    return `${Number(dia)} de ${meses[Number(mes) - 1]}`;
  }

  @HostListener('document:click')
  fecharDropdowns() {
    this.mostrarCalendario = false;
    this.mostrarHospedes = false;
    this.mostrarSugestoesLocal = false;
  }

  @HostListener('document:keydown.enter')
  onEnterPress() {
    if (this.mostrarCalendario || this.mostrarHospedes || this.mostrarSugestoesLocal) {
      return;
    }

    this.buscar();
  }

  abrirCalendario() {
    this.mostrarCalendario = !this.mostrarCalendario;
    this.mostrarHospedes = false;
    this.mostrarSugestoesLocal = false;
  }

  limparBusca() {
    this.localSelecionado = '';
    this.dataEntrada = null;
    this.dataSaida = null;
    this.adultos = 0;
    this.criancas = 0;

    this.hospedagensFiltradas = [...this.hospedagens];
  }

  abrirHospedes() {
    this.mostrarHospedes = !this.mostrarHospedes;
    this.mostrarCalendario = false;
    this.mostrarSugestoesLocal = false;
  }

  selecionarLocal(lugar: string) {
    this.localSelecionado = lugar;
    this.mostrarSugestoesLocal = false;
  }

  selecionarData(data: string) {
    if (this.dataEstaNoPassado(data)) {
      return;
    }

    if (!this.dataEntrada || this.dataSaida) {
      this.dataEntrada = data;
      this.dataSaida = null;
      return;
    }

    if (data < this.dataEntrada) {
      this.dataEntrada = data;
      this.dataSaida = null;
      return;
    }

    if (data === this.dataEntrada) {
      return;
    }

    this.dataSaida = data;
  }
  alterarQuantidade(tipo: 'adultos' | 'criancas', valor: number) {
    const total = this.adultos + this.criancas;

    if (tipo === 'adultos') {
      const novoValor = this.adultos + valor;

      if (novoValor < 0) return;
      if (valor > 0 && total >= 6) return;

      this.adultos = novoValor;
    }

    if (tipo === 'criancas') {
      const novoValor = this.criancas + valor;

      if (novoValor < 0) return;
      if (valor > 0 && this.criancas >= 4) return;
      if (valor > 0 && total >= 6) return;

      this.criancas = novoValor;
    }
  }

  buscar() {
    this.hospedagensFiltradas = this.hospedagens.filter((item) =>
      (item.local ?? '').toLowerCase().includes(this.localSelecionado.toLowerCase()),
    );

    this.mostrarSugestoesLocal = false;
    this.mostrarCalendario = false;
    this.mostrarHospedes = false;
  }

  scrollDireita() {
    this.lista.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollEsquerda() {
    this.lista.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }

  irParaMinhasReservas() {
    this.router.navigate(['/minhas-reservas']);
  }

  sair() {
    localStorage.removeItem('usuarioLogado');
    this.usuarioLogado = null;
    this.router.navigate(['/home']);
  }
  atualizarCalendario() {
    this.mesAtualCalendario = this.criarMesCalendario(
      this.hoje.getFullYear(),
      this.hoje.getMonth(),
    );

    this.proximoMesCalendario = this.criarMesCalendario(
      this.hoje.getFullYear(),
      this.hoje.getMonth() + 1,
    );
  }

  avancarMesCalendario() {
    this.hoje = new Date(this.hoje.getFullYear(), this.hoje.getMonth() + 1, 1);
    this.atualizarCalendario();
  }

  voltarMesCalendario() {
    this.hoje = new Date(this.hoje.getFullYear(), this.hoje.getMonth() - 1, 1);
    this.atualizarCalendario();
  }
  dataEstaNoPassado(data: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataComparada = new Date(data + 'T00:00:00');

    return dataComparada < hoje;
  }
  dataEstaNoIntervalo(data: string) {
    if (!this.dataEntrada || !this.dataSaida) {
      return false;
    }

    return data > this.dataEntrada && data < this.dataSaida;
  }
}
