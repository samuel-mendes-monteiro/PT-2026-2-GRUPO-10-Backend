import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Obrigatória somente quando uma nova senha for enviada
  @ValidateIf((o) => o.senhaHash !== undefined)
  @IsString({ message: 'A senha atual deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória para alterar a senha.' })
  senhaAtual?: string;
}