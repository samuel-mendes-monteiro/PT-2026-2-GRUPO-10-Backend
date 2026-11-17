import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStoreReviewDto } from './dto/create-store-review.dto.js';
import { UpdateStoreReviewDto } from './dto/update-store-review.dto.js';

// Dados públicos do autor. NUNCA devolver o usuário inteiro (tem email e senhaHash).
const AUTOR = {
  select: { id: true, username: true, nome: true, fotoPerfilUrl: true },
};

// Dados da loja avaliada (para mostrar o card sem outra requisição)
const LOJA = {
  select: { id: true, nome: true, logoUrl: true },
};

@Injectable()
export class StoreReviewsService {
  constructor(private readonly prisma: PrismaService) { }

  // ---------- Create ----------

  async create(dto: CreateStoreReviewDto, usuarioId: number) {
    const loja = await this.prisma.loja.findUnique({
      where: { id: dto.lojaId },
    });
    if (!loja) throw new NotFoundException('Loja não encontrada');

    // Regra: o dono não avalia a própria loja
    if (loja.usuarioId === usuarioId) {
      throw new BadRequestException('Você não pode avaliar a sua própria loja');
    }

    // Regra: 1 avaliação por usuário em cada loja
    const jaAvaliou = await this.prisma.avaliacaoLoja.findFirst({
      where: { usuarioId, lojaId: dto.lojaId },
    });
    if (jaAvaliou) {
      throw new ConflictException('Você já avaliou esta loja');
    }

    return this.prisma.avaliacaoLoja.create({
      data: {
        usuarioId, // vem do token, nunca do body
        lojaId: dto.lojaId,
        nota: dto.nota,
        comentario: dto.comentario,
      },
      include: { usuario: AUTOR, loja: LOJA },
    });
  }

  // ---------- Finds ----------

  // Filtros opcionais: ?lojaId=2 e/ou ?usuarioId=5
  findAll(filtros: { lojaId?: number; usuarioId?: number }) {
    return this.prisma.avaliacaoLoja.findMany({
      where: { lojaId: filtros.lojaId, usuarioId: filtros.usuarioId },
      include: {
        usuario: AUTOR,
        loja: LOJA,
        _count: { select: { comentarios: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const avaliacao = await this.prisma.avaliacaoLoja.findUnique({
      where: { id },
      include: {
        usuario: AUTOR,
        loja: LOJA,
        // Só os comentários "de cima"; as respostas vêm aninhadas em cada um
        comentarios: {
          where: { comentarioPaiId: null },
          include: {
            usuario: AUTOR,
            respostas: {
              include: { usuario: AUTOR },
              orderBy: { createdAt: 'asc' },
            },
          },
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

  async update(id: number, dto: UpdateStoreReviewDto, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);

    return this.prisma.avaliacaoLoja.update({
      where: { id },
      data: { nota: dto.nota, comentario: dto.comentario },
      include: { usuario: AUTOR, loja: LOJA },
    });
  }

  // ---------- Remove ----------

  async remove(id: number, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);

    // Os comentários da avaliação caem em cascata pelo schema
    return this.prisma.avaliacaoLoja.delete({ where: { id } });
  }

  // ---------- Auxiliares ----------

  // 404 se não existe, 403 se não foi o usuário logado que escreveu
  private async buscarSeForAutor(id: number, usuarioId: number) {
    const avaliacao = await this.prisma.avaliacaoLoja.findUnique({
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
