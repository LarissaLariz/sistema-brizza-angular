import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Imoveis } from '../services/imoveis';

@Component({
  selector: 'app-admin-imoveis',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-imoveis.html',
  styleUrl: './admin-imoveis.css',
})
export class AdminImoveis {
  imoveis: any[] = [];

  mostrarFormulario = false;
  modoEdicao = false;
  imovelEditandoId: number | null = null;

  mensagemErro = '';
  mensagemSucesso = '';

  bairrosDisponiveis = ['Pitangueiras', 'Enseada', 'Astúrias', 'Tombo', 'Guaiúba', 'Centro'];

  comodidadesDisponiveis = [
    'Wi-Fi',
    'Piscina',
    'Ar-condicionado',
    'Cozinha',
    'Garagem',
    'TV',
    'Churrasqueira',
    'Elevador',
  ];

  novoImovel = {
    titulo: '',
    local: '',
    descricao: '',
    preco: 0,
    taxaLimpeza: 0,
    checkin: '14:00',
    checkout: '11:00',
    hospedes: 1,
    quartos: 1,
    imagens: [] as string[],
    comodidades: [] as string[],
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private imoveisService: Imoveis,
  ) {
    this.carregarImoveis();
  }

  carregarImoveis() {
    this.imoveisService.listarImoveis().subscribe({
      next: (imoveisDoBanco: any[]) => {
        this.imoveis = imoveisDoBanco.map((imovel: any) => this.mapearImovelDoBanco(imovel));
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar imóveis da API:', erro);
        this.mensagemErro = 'Não foi possível carregar os imóveis. Verifique se o backend está rodando.';
        this.cdr.detectChanges();
      },
    });
  }

  mapearImovelDoBanco(imovel: any) {
    return {
      id: Number(imovel.id),
      titulo: imovel.nome,
      local: imovel.cidade,
      descricao: imovel.descricao,
      preco: Number(imovel.preco_por_noite || 0),
      taxaLimpeza: Number(imovel.taxa_limpeza || 0),
      checkin: imovel.checkin || '14:00',
      checkout: imovel.checkout || '11:00',
      hospedes: Number(imovel.capacidade_maxima || 1),
      quartos: Number(imovel.quartos || 1),
      imagens: imovel.imagens || [],
      comodidades: imovel.comodidades || [],
    };
  }

  mapearImovelParaBanco(imovel: any) {
    return {
      nome: imovel.titulo,
      cidade: imovel.local,
      descricao: imovel.descricao,
      preco_por_noite: imovel.preco,
      capacidade_maxima: imovel.hospedes,
      imagens: imovel.imagens,
      comodidades: imovel.comodidades,
    };
  }

  abrirFormularioAdicionar() {
    this.limparFormulario();
    this.mostrarFormulario = true;
    this.modoEdicao = false;
    this.imovelEditandoId = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  editarImovel(imovel: any) {
    this.novoImovel = {
      titulo: imovel.titulo,
      local: imovel.local,
      descricao: imovel.descricao,
      preco: imovel.preco,
      taxaLimpeza: imovel.taxaLimpeza || 0,
      checkin: imovel.checkin || '14:00',
      checkout: imovel.checkout || '11:00',
      hospedes: imovel.hospedes || 1,
      quartos: imovel.quartos || 1,
      imagens: [...(imovel.imagens || [])],
      comodidades: [...(imovel.comodidades || [])],
    };

    this.mostrarFormulario = true;
    this.modoEdicao = true;
    this.imovelEditandoId = imovel.id;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    setTimeout(() => {
      document.getElementById('formulario-imovel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  cancelarFormulario() {
    this.limparFormulario();
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.imovelEditandoId = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  adicionarQuantidade(campo: 'hospedes' | 'quartos') {
    if (this.novoImovel[campo] >= 4) {
      return;
    }

    this.novoImovel[campo]++;
  }

  removerQuantidade(campo: 'hospedes' | 'quartos') {
    if (this.novoImovel[campo] <= 1) {
      return;
    }

    this.novoImovel[campo]--;
  }

  async selecionarImagens(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivos = Array.from(input.files);
    input.value = '';

    for (const arquivo of arquivos) {
      const imagemReduzida = await this.converterImagemParaBase64Reduzida(arquivo);

      this.zone.run(() => {
        this.novoImovel.imagens = [...this.novoImovel.imagens, imagemReduzida];
        this.cdr.detectChanges();
      });
    }
  }

  converterImagemParaBase64Reduzida(arquivo: File): Promise<string> {
    return new Promise((resolve) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        const imagem = new Image();

        imagem.onload = () => {
          const canvas = document.createElement('canvas');
          const larguraMaxima = 900;
          const proporcao = larguraMaxima / imagem.width;

          canvas.width = larguraMaxima;
          canvas.height = imagem.height * proporcao;

          const contexto = canvas.getContext('2d');

          if (contexto) {
            contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
          }

          const imagemReduzida = canvas.toDataURL('image/jpeg', 0.7);
          resolve(imagemReduzida);
        };

        imagem.src = leitor.result as string;
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  removerImagem(index: number) {
    this.novoImovel.imagens = this.novoImovel.imagens.filter((_, posicao) => posicao !== index);
  }

  alterarComodidade(comodidade: string, event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      this.novoImovel.comodidades.push(comodidade);
    } else {
      this.novoImovel.comodidades = this.novoImovel.comodidades.filter(
        (item) => item !== comodidade,
      );
    }
  }

  salvarImovel() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.novoImovel.titulo) {
      this.mensagemErro = 'Preencha o título do imóvel.';
      return;
    }

    if (!this.novoImovel.local) {
      this.mensagemErro = 'Selecione a localização do imóvel.';
      return;
    }

    if (!this.novoImovel.descricao) {
      this.mensagemErro = 'Preencha a descrição do imóvel.';
      return;
    }

    if (this.novoImovel.preco <= 0) {
      this.mensagemErro = 'Informe um preço maior que zero.';
      return;
    }

    if (this.novoImovel.hospedes < 1 || this.novoImovel.hospedes > 4) {
      this.mensagemErro = 'A quantidade de hóspedes deve ser entre 1 e 4.';
      return;
    }

    if (this.novoImovel.quartos < 1 || this.novoImovel.quartos > 4) {
      this.mensagemErro = 'A quantidade de quartos deve ser entre 1 e 4.';
      return;
    }

    if (this.novoImovel.imagens.length === 0) {
      this.mensagemErro = 'Adicione pelo menos uma foto do imóvel.';
      return;
    }

    const imovelParaBanco = this.mapearImovelParaBanco(this.novoImovel);

    if (this.modoEdicao && this.imovelEditandoId !== null) {
      this.imoveisService.atualizarImovel(this.imovelEditandoId, imovelParaBanco).subscribe({
        next: () => this.finalizarSalvamento(true),
        error: (erro) => this.tratarErroSalvar(erro),
      });
      return;
    }

    this.imoveisService.criarImovel(imovelParaBanco).subscribe({
      next: () => this.finalizarSalvamento(false),
      error: (erro) => this.tratarErroSalvar(erro),
    });
  }

  finalizarSalvamento(estavaEditando: boolean) {
    this.carregarImoveis();
    this.limparFormulario();
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.imovelEditandoId = null;

    this.mensagemSucesso = estavaEditando
      ? 'Imóvel atualizado com sucesso!'
      : 'Imóvel cadastrado com sucesso!';

    this.cdr.detectChanges();
  }

  tratarErroSalvar(erro: any) {
    console.error('Erro ao salvar imóvel:', erro);
    this.mensagemErro = 'Não foi possível salvar o imóvel. Verifique se o backend está rodando.';
    this.cdr.detectChanges();
  }

  removerImovel(id: number) {
    const confirmar = confirm('Tem certeza que deseja remover este imóvel?');

    if (!confirmar) {
      return;
    }

    this.imoveisService.removerImovel(id).subscribe({
      next: () => {
        this.carregarImoveis();
        this.mensagemSucesso = 'Imóvel removido com sucesso.';
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao remover imóvel:', erro);
        this.mensagemErro = 'Não foi possível remover o imóvel.';
        this.cdr.detectChanges();
      },
    });
  }

  limparFormulario() {
    this.novoImovel = {
      titulo: '',
      local: '',
      descricao: '',
      preco: 0,
      taxaLimpeza: 0,
      checkin: '14:00',
      checkout: '11:00',
      hospedes: 1,
      quartos: 1,
      imagens: [],
      comodidades: [],
    };
  }

  obterTextoOrigem(imovel: any) {
    return 'Imóvel cadastrado';
  }

  obterTextoBotaoRemover(imovel: any) {
    return 'Remover';
  }

  formatarPreco(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  }

  formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  }

  formatarPrecoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numeros = input.value.replace(/\D/g, '');
    const valor = Number(numeros) / 100;

    this.novoImovel.preco = valor;
    input.value = this.formatarMoeda(valor);
  }

  formatarTaxaLimpezaInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numeros = input.value.replace(/\D/g, '');
    const valor = Number(numeros) / 100;

    this.novoImovel.taxaLimpeza = valor;
    input.value = this.formatarMoeda(valor);
  }

  abrirSeletorHorario(input: HTMLInputElement) {
    input.showPicker?.();
  }
}