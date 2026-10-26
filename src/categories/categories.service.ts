import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  // ---------- Create ----------

  async create(dto: CreateCategoryDto) {
    // Se escolheu uma categoria pai, ela precisa existir
    if (dto.categoriaPaiId != null) {
      const pai = await this.prisma.categoria.findUnique({
        where: { id: dto.categoriaPaiId },
      });
      if (!pai) throw new NotFoundException('Categoria pai não encontrada');
    }

    return this.prisma.categoria.create({
      data: { nome: dto.nome, categoriaPaiId: dto.categoriaPaiId },
    });
  }

  // ---------- Finds ----------

  findAll() {
    return this.prisma.categoria.findMany({
      include: { subcategorias: true },
      orderBy: { nome: 'asc' },
    });
  }

  // Lista enxuta para popular o seletor de "categoria pai".
  // Retorna: [{ id, nome, caminho: "Eletrônicos > Celulares" }]
  async findOpcoes() {
    const categorias = await this.prisma.categoria.findMany({
      select: { id: true, nome: true, categoriaPaiId: true },
    });

    const porId = new Map(categorias.map((c) => [c.id, c]));

    return categorias
      .map((c) => {
        const caminho = [c.nome];
        let pai = c.categoriaPaiId ? porId.get(c.categoriaPaiId) : undefined;
        while (pai) {
          caminho.unshift(pai.nome);
          pai = pai.categoriaPaiId ? porId.get(pai.categoriaPaiId) : undefined;
        }
        return { id: c.id, nome: c.nome, caminho: caminho.join(' > ') };
      })
      .sort((a, b) => a.caminho.localeCompare(b.caminho));
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { categoriaPai: true, subcategorias: true },
    });
    if (!categoria) throw new NotFoundException('Categoria com Id não encontrada');
    return categoria;
  }

  // ---------- Update ----------

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id); // lança 404 se não existir

    if (dto.categoriaPaiId != null) {
      await this.validarPai(id, dto.categoriaPaiId);
    }

    // undefined = não altera o campo; null em categoriaPaiId = vira categoria raiz
    return this.prisma.categoria.update({
      where: { id },
      data: { nome: dto.nome, categoriaPaiId: dto.categoriaPaiId },
    });
  }

  // ---------- Remove ----------

  async remove(id: number) {
    await this.findOne(id);

    // Produto.categoria usa onDelete: Restrict, então bloqueamos antes
    const totalProdutos = await this.prisma.produto.count({
      where: { categoriaId: id },
    });
    if (totalProdutos > 0) {
      throw new ConflictException(
        'Não é possível apagar: existem produtos nesta categoria',
      );
    }

    // As subcategorias viram categorias raiz (onDelete: SetNull no schema)
    return this.prisma.categoria.delete({ where: { id } });
  }

  // ---------- Auxiliares ----------

  // Sobe a árvore de ancestrais para impedir ciclos (A pai de B, B pai de A)
  private async validarPai(id: number, paiId: number) {
    let atual: number | null = paiId;

    while (atual !== null) {
      if (atual === id) {
        throw new BadRequestException(
          'Uma categoria não pode ser pai dela mesma nem de um ancestral',
        );
      }
      const categoria: { categoriaPaiId: number | null } | null =
        await this.prisma.categoria.findUnique({
          where: { id: atual },
          select: { categoriaPaiId: true },
        });
      if (!categoria) throw new NotFoundException('Categoria pai não encontrada');
      atual = categoria.categoriaPaiId;
    }
  }
}