import { Module } from '@nestjs/common';
import { StoreReviewsService } from './store-reviews.service.js';
import { StoreReviewsController } from './store-reviews.controller.js';

@Module({
  controllers: [StoreReviewsController],
  providers: [StoreReviewsService],
})
export class StoreReviewsModule { }
