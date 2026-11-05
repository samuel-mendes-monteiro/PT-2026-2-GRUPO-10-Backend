import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'O conteúdo deve ser uma string.' })
  @IsNotEmpty({ message: 'O conteúdo do comentário não pode estar vazio.' })
  conteudo!: string;

  // Informe UM dos dois: o comentário é de uma avaliação de produto OU de loja.
  // (essa regra "um dos dois" é checada no service)
  @IsOptional()
  @IsInt({ message: 'O id da avaliação de produto deve ser um inteiro.' })
  avaliacaoProdutoId?: number;

  @IsOptional()
  @IsInt({ message: 'O id da avaliação de loja deve ser um inteiro.' })
  avaliacaoLojaId?: number;
}
