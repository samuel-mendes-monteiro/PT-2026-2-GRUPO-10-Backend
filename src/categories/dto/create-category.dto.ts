import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
     @IsString({ message: 'O nome deve ser uma string.' })
     @IsNotEmpty({ message: 'O nome da categoria não pode estar vazio' })
     @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
     nome!: string;

     // Id da categoria pai (escolhida no seletor). Omitido ou null = categoria raiz.
     @IsOptional()
     @IsInt({ message: 'O id da categoria pai deve ser um número inteiro.' })
     categoriaPaiId?: number | null;
}