import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  // Loja que vai vender o produto (precisa ser do usuário logado)
  @IsInt({ message: 'O id da loja deve ser um número inteiro.' })
  lojaId!: number;

  @IsInt({ message: 'O id da categoria deve ser um número inteiro.' })
  categoriaId!: number;

  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do produto não pode estar vazio.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome!: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  descricao?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O preço deve ser um número com até 2 casas decimais.' },
  )
  @Min(0, { message: 'O preço não pode ser negativo.' })
  preco!: number;

  @IsInt({ message: 'O estoque deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque não pode ser negativo.' })
  estoque!: number;
}
