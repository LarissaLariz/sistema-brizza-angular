import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  imoveisFixos = [
    {
      id: 1,
      origem: 'fixo',
      titulo: 'Golden Beach 158',
      local: 'Pitangueiras',
      descricao: 'Hospedagem confortável no Guarujá...',
      imagens: ['/images/imagem1.jpeg', '/images/imagem2.jpeg', '/images/imagem3.jpeg'],
      preco: 200,
      taxaLimpeza: 0,
      checkin: '14:00',
      checkout: '11:00',
      hospedes: 4,
      quartos: 1,
      comodidades: ['Wi-Fi', 'Piscina', 'Ar-condicionado', 'Cozinha'],
    },
    {
      id: 2,
      origem: 'fixo',
      titulo: 'Loft no centro',
      local: 'Tombo',
      descricao: 'Vista para a cidade',
      imagens: ['/images/imagem2.jpeg', '/images/imagem1.jpeg', '/images/imagem3.jpeg'],
      preco: 180,
      taxaLimpeza: 0,
      checkin: '14:00',
      checkout: '11:00',
      hospedes: 4,
      quartos: 1,
      comodidades: ['Wi-Fi', 'Cozinha'],
    },
    {
      id: 3,
      origem: 'fixo',
      titulo: 'Loft na serra',
      local: 'Astúrias',
      descricao: 'Vista para a montanha',
      imagens: ['/images/imagem3.jpeg', '/images/imagem1.jpeg', '/images/imagem2.jpeg'],
      preco: 220,
      taxaLimpeza: 0,
      checkin: '14:00',
      checkout: '11:00',
      hospedes: 4,
      quartos: 1,
      comodidades: ['Wi-Fi', 'Ar-condicionado'],
    },
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
  ) {
    this.carregarImoveis();
  }

  carregarImoveis() {
    const dados = localStorage.getItem('imoveis');
    const imoveisSalvos = dados ? JSON.parse(dados) : [];

    const mapa = new Map<number, any>();

    this.imoveisFixos.forEach((imovel) => {
      mapa.set(imovel.id, imovel);
    });

    imoveisSalvos.forEach((imovel: any) => {
      mapa.set(imovel.id, {
        ...imovel,
        origem: imovel.origem || 'criado',
      });
    });

    this.imoveis = Array.from(mapa.values());
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

    const dados = localStorage.getItem('imoveis');
    const imoveisSalvos = dados ? JSON.parse(dados) : [];

    let novaListaSalva: any[] = [];

    if (this.modoEdicao && this.imovelEditandoId !== null) {
      const imovelAtual = this.imoveis.find((imovel) => imovel.id === this.imovelEditandoId);

      const imovelEditado = {
        id: this.imovelEditandoId,
        origem: imovelAtual?.origem === 'fixo' ? 'fixo-editado' : 'criado',
        ...this.novoImovel,
      };

      const jaExisteNoStorage = imoveisSalvos.some(
        (imovel: any) => imovel.id === this.imovelEditandoId,
      );

      if (jaExisteNoStorage) {
        novaListaSalva = imoveisSalvos.map((imovel: any) => {
          if (imovel.id === this.imovelEditandoId) {
            return imovelEditado;
          }

          return imovel;
        });
      } else {
        novaListaSalva = [...imoveisSalvos, imovelEditado];
      }
    } else {
      const imovel = {
        id: new Date().getTime(),
        origem: 'criado',
        ...this.novoImovel,
      };

      novaListaSalva = [...imoveisSalvos, imovel];
    }

    const salvou = this.salvarNoLocalStorage(novaListaSalva);

    if (!salvou) {
      this.mensagemErro =
        'Não foi possível salvar. As imagens ainda estão muito pesadas para o navegador.';
      return;
    }

    const estavaEditando = this.modoEdicao;

    this.carregarImoveis();
    this.limparFormulario();
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.imovelEditandoId = null;

    this.mensagemSucesso = estavaEditando
      ? 'Imóvel atualizado com sucesso!'
      : 'Imóvel cadastrado com sucesso!';
  }

  salvarNoLocalStorage(lista: any[]) {
    try {
      localStorage.setItem('imoveis', JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  }

  removerImovel(id: number) {
    const imovel = this.imoveis.find((item) => item.id === id);

    if (!imovel) {
      return;
    }

    const mensagem =
      imovel.origem === 'fixo' || imovel.origem === 'fixo-editado'
        ? 'Esse é um imóvel padrão. Deseja restaurar ele para o padrão original?'
        : 'Tem certeza que deseja remover este imóvel?';

    const confirmar = confirm(mensagem);

    if (!confirmar) {
      return;
    }

    const dados = localStorage.getItem('imoveis');
    const imoveisSalvos = dados ? JSON.parse(dados) : [];

    const novaLista = imoveisSalvos.filter((item: any) => item.id !== id);

    const salvou = this.salvarNoLocalStorage(novaLista);

    if (salvou) {
      this.carregarImoveis();
      this.mensagemSucesso =
        imovel.origem === 'fixo' || imovel.origem === 'fixo-editado'
          ? 'Imóvel restaurado para o padrão original.'
          : 'Imóvel removido com sucesso.';
    }
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

  formatarPreco(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  }

  obterTextoOrigem(imovel: any) {
    if (imovel.origem === 'fixo') {
      return 'Imóvel padrão';
    }

    if (imovel.origem === 'fixo-editado') {
      return 'Imóvel padrão editado';
    }

    return 'Imóvel cadastrado';
  }

  obterTextoBotaoRemover(imovel: any) {
    if (imovel.origem === 'fixo' || imovel.origem === 'fixo-editado') {
      return 'Desfazer alterações';
    }

    return 'Remover';
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
