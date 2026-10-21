import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestBody {
  @IsNotEmpty({ message: 'O campo email não pode estar vazio' })
  @IsEmail({}, { message: 'Forneça um endereço de email válido' })
  email: string;

  @IsNotEmpty({ message: 'O campo senhaHash não pode estar vazio' })
  @IsString({ message: 'O campo senhaHash tem de ser uma string' })
  senhaHash: string;
};