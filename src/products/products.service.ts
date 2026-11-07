import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

// Ordenações aceitas em GET /products?ordenarPor=
// relevancia = produtos mais avaliados primeiro (quantidade de avaliações)
const ORDENACOES = ['recentes', 'nome', 'preco', 'relevancia'] as const;
type Ordenacao = (typeof ORDENACOES)[number];
type Ordem = 'asc' | 'desc';

// Sentido padrão de cada ordenação quando ?ordem= não é informado
const ORDEM_PADRAO: Record<Ordenacao, Ordem> = {
  recentes: 'desc',
  nome: 'asc',
  preco: 'asc',
  relevancia: 'desc',
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  // ---------- Create ----------

  async create(dto: CreateProductDto, usuarioId: number) {
    // 1) A loja existe e é do usuário logado?
    const loja = await this.prisma.loja.findUnique({
      where: { id: dto.lojaId },
    });
    if (!loja) throw new NotFoundException('Loja não encontrada');
    if (loja.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você só pode cadastrar produtos nas suas próprias lojas',
      );
    }

    // 2) A categoria existe?
    await this.validarCategoria(dto.categoriaId);

    return this.prisma.produto.create({
      data: {
        lojaId: dto.lojaId,
        categoriaId: dto.categoriaId,
        nome: dto.nome,
        descricao: dto.descricao,
        preco: dto.preco,
        estoque: dto.estoque,
      },
    });
  }

  // ---------- Finds ----------

  // Filtros opcionais: ?categoria=Eletrônicos&lojaId=2&busca=camisa
  // Ordenação opcional: ?ordenarPor=recentes|nome|preco|relevancia&ordem=asc|desc
  async findAll(filtros: {
    categoria?: string;
    lojaId?: number;
    busca?: string;
    ordenarPor?: string;
    ordem?: string;
  }) {
    const ordenarPor = this.validarOrdenacao(filtros.ordenarPor);
    const ordem = this.validarOrdem(filtros.ordem) ?? ORDEM_PADRAO[ordenarPor];

    // ?categoria= pelo NOME. Se a categoria for pai de outras (ex.: Eletrônicos),
    // os produtos das filhas (Celulares, Notebooks...) também entram.
    const categoriaIds = filtros.categoria
      ? await this.idsDaCategoriaComFilhas(filtros.categoria)
      : undefined;

    return this.prisma.produto.findMany({
      where: {
        categoriaId: categoriaIds ? { in: categoriaIds } : undefined,
        lojaId: filtros.lojaId,
        nome: filtros.busca
          ? { contains: filtros.busca, mode: 'insensitive' }
          : undefined,
      },
      include: {
        categoria: { select: { id: true, nome: true } },
        loja: { select: { id: true, nome: true } },
      },
      orderBy: this.montarOrdenacao(ordenarPor, ordem),
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nome: true } },
        loja: { select: { id: true, nome: true } },
        imagens: { orderBy: { ordem: 'asc' } },
      },
    });
    if (!produto) throw new NotFoundException('Produto com Id não encontrado');

    // Resumo das avaliações (média e quantidade) calculado direto no banco
    const resumo = await this.prisma.avaliacaoProduto.aggregate({
      where: { produtoId: id },
      _avg: { nota: true },
      _count: { _all: true },
    });

    return {
      ...produto,
      mediaNotas: resumo._avg.nota,
      totalAvaliacoes: resumo._count._all,
    };
  }

  // ---------- Update ----------

  async update(id: number, dto: UpdateProductDto, usuarioId: number) {
    await this.buscarSeForDono(id, usuarioId);

    if (dto.categoriaId != null) {
      await this.validarCategoria(dto.categoriaId);
    }

    // undefined = não altera o campo
    return this.prisma.produto.update({
      where: { id },
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        preco: dto.preco,
        estoque: dto.estoque,
        categoriaId: dto.categoriaId,
      },
    });
  }

  // ---------- Remove ----------

  async remove(id: number, usuarioId: number) {
    await this.buscarSeForDono(id, usuarioId);

    // Imagens e avaliações (e os comentários delas) caem em cascata pelo schema
    return this.prisma.produto.delete({ where: { id } });
  }

  // ---------- Auxiliares ----------

  private async validarCategoria(categoriaId: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
  }

  // Resolve o NOME da categoria (sem diferenciar maiúsculas/minúsculas) para o id dela
  // mais os ids de todas as descendentes. 404 se nenhuma categoria tiver esse nome.
  // (O nome não é único no banco, então partimos de todas as categorias com esse nome.)
  private async idsDaCategoriaComFilhas(nome: string): Promise<number[]> {
    const raizes = await this.prisma.categoria.findMany({
      where: { nome: { equals: nome, mode: 'insensitive' } },
      select: { id: true },
    });
    if (raizes.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const todas = await this.prisma.categoria.findMany({
      select: { id: true, categoriaPaiId: true },
    });
    const filhasPorPai = new Map<number, number[]>();
    for (const c of todas) {
      if (c.categoriaPaiId == null) continue;
      const filhas = filhasPorPai.get(c.categoriaPaiId) ?? [];
      filhas.push(c.id);
      filhasPorPai.set(c.categoriaPaiId, filhas);
    }

    // Percorre a árvore descendo nível a nível (o array cresce durante o for...of)
    const ids = new Set<number>(raizes.map((r) => r.id));
    for (const id of ids) {
      for (const filhaId of filhasPorPai.get(id) ?? []) ids.add(filhaId);
    }
    return [...ids];
  }

  private validarOrdenacao(valor?: string): Ordenacao {
    if (valor == null || valor === '') return 'recentes';
    if (!(ORDENACOES as readonly string[]).includes(valor)) {
      throw new BadRequestException(
        `ordenarPor inválido. Use: ${ORDENACOES.join(', ')}`,
      );
    }
    return valor as Ordenacao;
  }

  private validarOrdem(valor?: string): Ordem | undefined {
    if (valor == null || valor === '') return undefined;
    if (valor !== 'asc' && valor !== 'desc') {
      throw new BadRequestException('ordem inválida. Use: asc ou desc');
    }
    return valor;
  }

  // Sempre desempata por createdAt (mais novo primeiro) para a ordem ser estável
  private montarOrdenacao(ordenarPor: Ordenacao, ordem: Ordem) {
    switch (ordenarPor) {
      case 'nome':
        return [{ nome: ordem }, { createdAt: 'desc' as const }];
      case 'preco':
        return [{ preco: ordem }, { createdAt: 'desc' as const }];
      case 'relevancia':
        return [
          { avaliacoes: { _count: ordem } },
          { createdAt: 'desc' as const },
        ];
      default:
        return [{ createdAt: ordem }];
    }
  }

  // 404 se o produto não existe, 403 se a loja dele não é do usuário logado
  private async buscarSeForDono(id: number, usuarioId: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: { loja: { select: { usuarioId: true } } },
    });
    if (!produto) throw new NotFoundException('Produto com Id não encontrado');
    if (produto.loja.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você só pode alterar produtos das suas próprias lojas',
      );
    }
    return produto;
  }
}
