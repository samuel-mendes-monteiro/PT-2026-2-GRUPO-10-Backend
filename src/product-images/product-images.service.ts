import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';

@Injectable()
export class ProductImagesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateProductImageDto, usuarioId: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id: dto.produtoId },
      include: { loja: { select: { usuarioId: true } } },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    if (produto.loja.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você só pode adicionar imagens aos produtos das suas próprias lojas',
      );
    }

    const ordem = dto.ordem ?? (await this.proximaOrdem(dto.produtoId));

    return this.prisma.imagemProduto.create({
      data: {
        produtoId: dto.produtoId,
        urlImagem: dto.urlImagem,
        ordem,
      },
    });
  }

  findAll(filtros: { produtoId?: number }) {
    return this.prisma.imagemProduto.findMany({
      where: { produtoId: filtros.produtoId },
      orderBy: [{ produtoId: 'asc' }, { ordem: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const imagem = await this.prisma.imagemProduto.findUnique({
      where: { id },
    });
    if (!imagem) throw new NotFoundException('Imagem com Id não encontrada');
    return imagem;
  }

  async update(id: number, dto: UpdateProductImageDto, usuarioId: number) {
    await this.buscarSeForDono(id, usuarioId);

    return this.prisma.imagemProduto.update({
      where: { id },
      data: { urlImagem: dto.urlImagem, ordem: dto.ordem },
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.buscarSeForDono(id, usuarioId);

    return this.prisma.imagemProduto.delete({ where: { id } });
  }

  private async proximaOrdem(produtoId: number) {
    const resultado = await this.prisma.imagemProduto.aggregate({
      where: { produtoId },
      _max: { ordem: true },
    });
    return (resultado._max.ordem ?? 0) + 1;
  }

  private async buscarSeForDono(id: number, usuarioId: number) {
    const imagem = await this.prisma.imagemProduto.findUnique({
      where: { id },
      include: {
        produto: { select: { loja: { select: { usuarioId: true } } } },
      },
    });
    if (!imagem) throw new NotFoundException('Imagem com Id não encontrada');
    if (imagem.produto.loja.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você só pode alterar imagens dos produtos das suas próprias lojas',
      );
    }
    return imagem;
  }
}
