import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

// Dados públicos do autor. NUNCA devolver o usuário inteiro (tem email e senhaHash).
const AUTOR = {
  select: { id: true, username: true, nome: true, fotoPerfilUrl: true },
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) { }

  // ---------- Create ----------

  async create(dto: CreateReviewDto, usuarioId: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id: dto.produtoId },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // Regra: 1 avaliação por usuário em cada produto
    const jaAvaliou = await this.prisma.avaliacaoProduto.findFirst({
      where: { usuarioId, produtoId: dto.produtoId },
    });
    if (jaAvaliou) {
      throw new ConflictException('Você já avaliou este produto');
    }

    return this.prisma.avaliacaoProduto.create({
      data: {
        usuarioId, // vem do token, nunca do body
        produtoId: dto.produtoId,
        nota: dto.nota,
        comentario: dto.comentario,
      },
      include: { usuario: AUTOR },
    });
  }

  // ---------- Finds ----------

  // Filtros opcionais: ?produtoId=1&usuarioId=2
  findAll(filtros: { produtoId?: number; usuarioId?: number }) {
    return this.prisma.avaliacaoProduto.findMany({
      where: { produtoId: filtros.produtoId, usuarioId: filtros.usuarioId },
      include: {
        usuario: AUTOR,
        _count: { select: { comentarios: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const avaliacao = await this.prisma.avaliacaoProduto.findUnique({
      where: { id },
      include: {
        usuario: AUTOR,
        comentarios: {
          include: { usuario: AUTOR },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!avaliacao) {
      throw new NotFoundException('Avaliação com Id não encontrada');
    }
    return avaliacao;
  }

  // ---------- Update ----------

  async update(id: number, dto: UpdateReviewDto, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);

    return this.prisma.avaliacaoProduto.update({
      where: { id },
      data: { nota: dto.nota, comentario: dto.comentario },
      include: { usuario: AUTOR },
    });
  }

  // ---------- Remove ----------

  async remove(id: number, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);

    // Os comentários da avaliação caem em cascata pelo schema
    return this.prisma.avaliacaoProduto.delete({ where: { id } });
  }

  // ---------- Auxiliares ----------

  // 404 se não existe, 403 se não foi o usuário logado que escreveu
  private async buscarSeForAutor(id: number, usuarioId: number) {
    const avaliacao = await this.prisma.avaliacaoProduto.findUnique({
      where: { id },
    });
    if (!avaliacao) {
      throw new NotFoundException('Avaliação com Id não encontrada');
    }
    if (avaliacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você só pode alterar as suas avaliações');
    }
    return avaliacao;
  }
}
