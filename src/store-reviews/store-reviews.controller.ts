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
import { StoreReviewsService } from './store-reviews.service.js';
import { CreateStoreReviewDto } from './dto/create-store-review.dto.js';
import { UpdateStoreReviewDto } from './dto/update-store-review.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';

// Avaliações de LOJA. As de produto ficam em /reviews.
@Controller('store-reviews')
export class StoreReviewsController {
  constructor(private readonly storeReviewsService: StoreReviewsService) { }

  @Post()
  create(
    @Body() dto: CreateStoreReviewDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.storeReviewsService.create(dto, usuarioId);
  }

  @Public()
  @Get()
  findAll(
    @Query('lojaId', new ParseIntPipe({ optional: true })) lojaId?: number,
    @Query('usuarioId', new ParseIntPipe({ optional: true }))
    usuarioId?: number,
  ) {
    return this.storeReviewsService.findAll({ lojaId, usuarioId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeReviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreReviewDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.storeReviewsService.update(id, dto, usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.storeReviewsService.remove(id, usuarioId);
  }
}
