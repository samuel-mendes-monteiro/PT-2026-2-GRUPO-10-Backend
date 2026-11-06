import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductImageDto {
  @IsInt({ message: 'O id do produto deve ser um número inteiro.' })
  produtoId!: number;

  @IsNotEmpty({ message: 'A url da imagem não pode estar vazia.' })
  @IsUrl({}, { message: 'A url da imagem deve ser uma URL válida.' })
  @MaxLength(255, { message: 'A url deve ter no máximo 255 caracteres.' })
  urlImagem!: string;

  @IsOptional()
  @IsInt({ message: 'A ordem deve ser um número inteiro.' })
  @Min(1, { message: 'A ordem deve ser no mínimo 1.' })
  ordem?: number;
}
