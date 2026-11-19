
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLojaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da loja não pode estar vazio.' })
  @MaxLength(255)
  nome: string;

  @IsInt({ message: 'A categoria deve ser selecionada.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  categoriaId: number;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  stickerUrl?: string;
}