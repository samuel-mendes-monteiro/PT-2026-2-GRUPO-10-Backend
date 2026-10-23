import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'O token não pode estar vazio' })
  token!: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo novaSenha não pode estar vazio.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  novaSenha!: string;
}