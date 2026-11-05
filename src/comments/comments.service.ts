import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

// Dados públicos do autor. NUNCA devolver o usuário inteiro (tem email e senhaHash).
const AUTOR = {
  select: { id: true, username: true, nome: true, fotoPerfilUrl: true },
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) { }

  // ---------- Create ----------

  async create(dto: CreateCommentDto, usuarioId: number) {
    const temProduto = dto.avaliacaoProdutoId != null;
    const temLoja = dto.avaliacaoLojaId != null;

    // Exatamente um dos dois (nem nenhum, nem os dois)
    if (temProduto === temLoja) {
      throw new BadRequestException(
        'Informe avaliacaoProdutoId OU avaliacaoLojaId (apenas um dos dois)',
      );
    }

    if (temProduto) {
      const avaliacao = await this.prisma.avaliacaoProduto.findUnique({
        where: { id: dto.avaliacaoProdutoId },
      });
      if (!avaliacao) {
        throw new NotFoundException('Avaliação de produto não encontrada');
      }
    } else {
      const avaliacao = await this.prisma.avaliacaoLoja.findUnique({
        where: { id: dto.avaliacaoLojaId },
      });
      if (!avaliacao) {
        throw new NotFoundException('Avaliação de loja não encontrada');
      }
    }

    return this.prisma.comentarioAvaliacao.create({
      data: {
        usuarioId, // vem do token, nunca do body
        conteudo: dto.conteudo,
        avaliacaoProdutoId: dto.avaliacaoProdutoId,
        avaliacaoLojaId: dto.avaliacaoLojaId,
      },
      include: { usuario: AUTOR },
    });
  }

  // ---------- Finds ----------

  // Obrigatório informar de qual avaliação quer os comentários,
  // para a rota não despejar a tabela inteira.
  findAll(filtros: { avaliacaoProdutoId?: number; avaliacaoLojaId?: number }) {
    if (filtros.avaliacaoProdutoId == null && filtros.avaliacaoLojaId == null) {
      throw new BadRequestException(
        'Informe ?avaliacaoProdutoId= ou ?avaliacaoLojaId= na consulta',
      );
    }

    return this.prisma.comentarioAvaliacao.findMany({
      where: {
        avaliacaoProdutoId: filtros.avaliacaoProdutoId,
        avaliacaoLojaId: filtros.avaliacaoLojaId,
      },
      include: { usuario: AUTOR },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const comentario = await this.prisma.comentarioAvaliacao.findUnique({
      where: { id },
      include: { usuario: AUTOR },
    });
    if (!comentario) {
      throw new NotFoundException('Comentário com Id não encontrado');
    }
    return comentario;
  }

  // ---------- Update ----------

  async update(id: number, dto: UpdateCommentDto, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);

    return this.prisma.comentarioAvaliacao.update({
      where: { id },
      data: { conteudo: dto.conteudo },
      include: { usuario: AUTOR },
    });
  }

  // ---------- Remove ----------

  async remove(id: number, usuarioId: number) {
    await this.buscarSeForAutor(id, usuarioId);
    return this.prisma.comentarioAvaliacao.delete({ where: { id } });
  }

  // ---------- Auxiliares ----------

  private async buscarSeForAutor(id: number, usuarioId: number) {
    const comentario = await this.prisma.comentarioAvaliacao.findUnique({
      where: { id },
    });
    if (!comentario) {
      throw new NotFoundException('Comentário com Id não encontrado');
    }
    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você só pode alterar os seus comentários');
    }
    return comentario;
  }
}
