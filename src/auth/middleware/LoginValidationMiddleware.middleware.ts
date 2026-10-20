import {
    BadRequestException,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoginRequestBody } from '../dto/loginRequestBody.dto.js';
import { validate } from 'class-validator';

@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const body = req.body;

        const loginRequestBody = new LoginRequestBody();
        loginRequestBody.email = body.email;
        loginRequestBody.senha = body.senha;

        const validations = await validate(loginRequestBody);

        if (validations.length) {
            // O flatMap itera sobre os erros, extrai os valores das constraints (se existirem)
            // e já "achata" (junta) tudo em um único array de strings.
            const errorMessages = validations.flatMap((curr) =>
                curr.constraints ? Object.values(curr.constraints) : []
            );

            throw new BadRequestException(errorMessages);
        }

        next();
    }
}