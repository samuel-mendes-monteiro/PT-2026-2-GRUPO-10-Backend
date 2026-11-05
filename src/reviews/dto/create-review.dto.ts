import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'O id do produto deve ser um número inteiro.' })
  produtoId!: number;

  @IsInt({ message: 'A nota deve ser um número inteiro.' })
  @Min(1, { message: 'A nota mínima é 1.' })
  @Max(5, { message: 'A nota máxima é 5.' })
  nota!: number;

  @IsOptional()
  @IsString({ message: 'O comentário deve ser uma string.' })
  comentario?: string;
}
