import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule { }
