import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get('SMTP_PORT') ?? 587),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async enviarRecuperacaoSenha(para: string, link: string) {
    // Sem SMTP configurado (dev), só mostra o link no console
    if (!this.transporter) {
      this.logger.warn(`SMTP não configurado. Link de recuperação de ${para}: ${link}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('MAIL_FROM'),
      to: para,
      subject: 'Recuperação de senha',
      text:
        `Recebemos um pedido para redefinir sua senha.\n\n` +
        `Acesse o link abaixo (válido por 30 minutos):\n${link}\n\n` +
        `Se não foi você, ignore este e-mail.`,
    });
  }
}