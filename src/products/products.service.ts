import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

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

  // Filtros opcionais: ?categoriaId=1&lojaId=2&busca=camisa
  findAll(filtros: { categoria?: string; lojaId?: number; busca?: string }) {
    return this.prisma.produto.findMany({
      where: {
        // Busca dentro da relação "categoria" pelo nome exato, ignorando maiúsculas e minúsculas
        categoria: filtros.categoria
          ? {
              nome: {
                equals: filtros.categoria,
                mode: 'insensitive', 
              },
            }
          : undefined,
        lojaId: filtros.lojaId,
        nome: filtros.busca
          ? { contains: filtros.busca, mode: 'insensitive' }
          : undefined,
      },
      include: {
        categoria: { select: { id: true, nome: true } },
        loja: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: 'desc' },
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
