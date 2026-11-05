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
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productsService.create(dto, usuarioId);
  }

  @Public()
  @Get()
  findAll(
    @Query('categoriaId', new ParseIntPipe({ optional: true }))
    categoriaId?: number,
    @Query('lojaId', new ParseIntPipe({ optional: true })) lojaId?: number,
    @Query('busca') busca?: string,
  ) {
    return this.productsService.findAll({ categoriaId, lojaId, busca });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productsService.update(id, dto, usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.productsService.remove(id, usuarioId);
  }
}
