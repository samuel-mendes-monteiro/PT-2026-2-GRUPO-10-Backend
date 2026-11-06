import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) { }

  @Post()
  create(
    @Body() dto: CreateProductImageDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productImagesService.create(dto, usuarioId);
  }

  @Public()
  @Get()
  findAll(
    @Query('produtoId', new ParseIntPipe({ optional: true }))
    produtoId?: number,
  ) {
    return this.productImagesService.findAll({ produtoId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productImagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductImageDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productImagesService.update(id, dto, usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productImagesService.remove(id, usuarioId);
  }
}
