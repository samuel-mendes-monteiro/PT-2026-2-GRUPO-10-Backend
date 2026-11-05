
import {IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLojaDto {
  

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

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