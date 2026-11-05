import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  create(
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.commentsService.create(dto, usuarioId);
  }

  @Public()
  @Get()
  findAll(
    @Query('avaliacaoProdutoId', new ParseIntPipe({ optional: true }))
    avaliacaoProdutoId?: number,
    @Query('avaliacaoLojaId', new ParseIntPipe({ optional: true }))
    avaliacaoLojaId?: number,
  ) {
    return this.commentsService.findAll({ avaliacaoProdutoId, avaliacaoLojaId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.commentsService.update(id, dto, usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.commentsService.remove(id, usuarioId);
  }
}
