import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HospedagemCard } from '../hospedagem-card/hospedagem-card';
import { Imoveis } from '../services/imoveis';

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

  proximoMesCalendario = this.criarMesCalendario(
    this.hoje.getFullYear(),
    this.hoje.getMonth() + 1,
  );

  lugares = ['Pitangueiras', 'Enseada', 'Astúrias', 'Tombo', 'Guaiúba', 'Centro'];

  hospedagens: any[] = [];

  hospedagensFiltradas: any[] = [];

  constructor(
    private router: Router,
    private imoveisService: Imoveis,
  ) {
    const usuario = localStorage.getItem('usuarioLogado');
    this.usuarioLogado = usuario ? JSON.parse(usuario) : null;

    this.carregarImoveisDaApi();
  }

  carregarImoveisDaApi() {
    this.imoveisService.listarImoveis().subscribe({
      next: (imoveisDoBanco) => {
       this.hospedagens = imoveisDoBanco.map((imovel: any) => ({
  id: Number(imovel.id),
  titulo: imovel.nome,
  local: imovel.cidade,
  descricao: imovel.descricao,
  imagem: '/images/imagem1.jpeg',
  imagens: ['/images/imagem1.jpeg', '/images/imagem2.jpeg', '/images/imagem3.jpeg'],
  preco: Number(imovel.preco_por_noite),
  hospedes: Number(imovel.capacidade_maxima),
  quartos: 1,
        }));

        this.hospedagensFiltradas = [...this.hospedagens];
      },
      error: (erro) => {
        console.error('Erro ao carregar imóveis da API:', erro);
      },
    });
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