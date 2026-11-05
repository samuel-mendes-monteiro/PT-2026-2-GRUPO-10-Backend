import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth-guard.js';
import { JwtModule } from '@nestjs/jwt';
import { CategoriesModule } from './categories/categories.module.js';
import { MailModule } from './mail/mail.module.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ProductsModule } from './products/products.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { LojasModule } from './lojas/lojas.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // padrão: 100 req/min por IP
    PrismaModule,
    UserModule,
    AuthModule,
    JwtModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    CommentsModule,
    MailModule,
    LojasModule,

  ],
  controllers: [AppController],
  providers: [AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule { }