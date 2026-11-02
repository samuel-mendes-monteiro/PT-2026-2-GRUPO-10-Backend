import { Module } from '@nestjs/common';
import { LojasService } from './lojas.service.js';
import { LojasController } from './lojas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [LojasController],
  providers: [LojasService],
})
export class LojasModule {}