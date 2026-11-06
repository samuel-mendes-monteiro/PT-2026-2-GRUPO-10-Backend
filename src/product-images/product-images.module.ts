import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service.js';
import { ProductImagesController } from './product-images.controller.js';

@Module({
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
})
export class ProductImagesModule { }
