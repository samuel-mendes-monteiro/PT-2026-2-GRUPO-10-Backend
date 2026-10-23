import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestBody } from './dto/loginRequestBody.dto.js';
import { UserToken } from './types/UserToken.js';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './types/UserPayload.js';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly TOKEN_TTL_MINUTOS = 30;

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) {}

    async login(loginRequestBody: LoginRequestBody): Promise<UserToken> {
        const user = await this.validateUser(loginRequestBody.email, loginRequestBody.senhaHash);
        if(!user) {
            throw new UnauthorizedException('Credenciais inválidas');
            }

        const payload : UserPayload = { email: user.email, sub: user.id};

        const jwtToken = this.jwtService.sign(payload, {expiresIn: '1d', secret: this.configService.get('JWT_SECRET')});

        return {
            access_token: jwtToken, // Caso queira verificar o token abra https://www.jwt.io/
        };
    }


        async validateUser(email: string, senhaHash: string) {
            const user = await this.userService.findByEmail(email);

            if(user)
            {
                const isPasswordValid = await bcrypt.compare(senhaHash, user.senhaHash);
                if(isPasswordValid)
                {
                    return {
                        ...user,
                        senha: undefined };
                } 

            }
                return null;
        }
        
    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userService.findByEmail(email);
        if (!user) return; // não revela se o e-mail existe

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + this.TOKEN_TTL_MINUTOS * 60_000);

        // Só um token ativo por usuário: apaga os anteriores e cria o novo
        await this.prisma.$transaction([
            this.prisma.tokenRecuperacaoSenha.deleteMany({ where: { usuarioId: user.id } }),
            this.prisma.tokenRecuperacaoSenha.create({
            data: { usuarioId: user.id, tokenHash: this.hashToken(token), expiresAt },
            }),
        ]);

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const link = `${frontendUrl}/redefinir-senha?token=${token}`;

        try {
            await this.mailService.enviarRecuperacaoSenha(user.email, link);
        } catch (error) {
        // Não propaga: um erro 500 só para e-mails existentes revelaria quem está cadastrado
        this.logger.error(`Falha ao enviar e-mail de recuperação para ${user.email}`, error);
        }
    }

    async resetPassword(token: string, novaSenha: string): Promise<void> {
        const tokenHash = this.hashToken(token);

        const registro = await this.prisma.tokenRecuperacaoSenha.findUnique({ where: { tokenHash } });
        if (!registro || registro.expiresAt < new Date()) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await this.prisma.$transaction(async (tx) => {
        // Consome o token de forma atômica: se duas requisições tentarem usar
        // o mesmo token ao mesmo tempo, só uma terá count === 1
        const consumido = await tx.tokenRecuperacaoSenha.deleteMany({
            where: { tokenHash, expiresAt: { gt: new Date() } },
        });
        if (consumido.count === 0) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        await tx.usuario.update({ where: { id: registro.usuarioId }, data: { senhaHash } });
        await tx.tokenRecuperacaoSenha.deleteMany({ where: { usuarioId: registro.usuarioId } });
        });
    }
    

}
