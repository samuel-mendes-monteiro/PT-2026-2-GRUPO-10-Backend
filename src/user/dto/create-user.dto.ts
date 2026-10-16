import { IsEmail, IsOptional, IsString, MinLength, IsNotEmpty, isEmail } from 'class-validator';
import { UserEntity } from '../entities/user.entity.js';
import { PartialType } from '@nestjs/mapped-types';


export class CreateUserDto extends PartialType(UserEntity) {

    @IsString({ message: 'O nome deve ser uma string.' })
    @IsNotEmpty({ message: 'O campo nome não pode estar vazio. ' })

    @IsEmail({}, { message: 'O email fornecido é inválido.' })
    @IsNotEmpty({ message: 'O campo email não pode estar vazio. ' })

    @IsString({ message: 'A senha deve ser uma string.' })
    @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
    senhaHash: string;

    @IsOptional()
    @IsString({ message: 'A url deve ser uma string.' })
    fotoPerfilUrl: string;

}
