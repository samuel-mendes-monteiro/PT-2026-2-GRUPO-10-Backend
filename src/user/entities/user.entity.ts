import { IsOptional, isString, IsString } from 'class-validator';


export class UserEntity {
    @IsString()
    id: string;

    @IsString()
    nome: string;

    @IsString()
    email: string;

    @IsString()
    senhaHash: string;

    @IsString()
    @IsOptional()
    fotoPerfilUrl: string;

    createdAt?: Date;
    updatedAt?: Date;

}