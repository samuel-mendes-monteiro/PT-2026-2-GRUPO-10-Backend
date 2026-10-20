import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestBody } from './dto/loginRequestBody.dto.js';
import { UserToken } from './types/UserToken.js';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './types/UserPayload.js';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService) {}

        async login(loginRequestBody: LoginRequestBody): Promise<UserToken> {
            const user = await this.validateUser(loginRequestBody.email, loginRequestBody.senha);
            if(!user) {
                throw new UnauthorizedException('Credenciais inválidas');
              }

            const payload : UserPayload = { email: user.email, sub: user.id};

            const jwtToken = this.jwtService.sign(payload, {expiresIn: '1d', secret: this.configService.get('JWT_SECRET')});

            return {
                access_token: jwtToken, // Caso queira verificar o token abra https://www.jwt.io/
            };
        }


        async validateUser(email: string, senha: string) {
            const user = await this.userService.findByEmail(email);

            if(user)
            {
                const isPasswordValid = await bcrypt.compare(senha, user.senhaHash);
                if(isPasswordValid)
                {
                    return {
                        ...user,
                        senha: undefined };
                } 

            }
                return null;
        }
    

}
