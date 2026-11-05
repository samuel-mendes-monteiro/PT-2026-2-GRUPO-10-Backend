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
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.reviewsService.create(dto, usuarioId);
  }

  @Public()
  @Get()
  findAll(
    @Query('produtoId', new ParseIntPipe({ optional: true }))
    produtoId?: number,
    @Query('usuarioId', new ParseIntPipe({ optional: true }))
    usuarioId?: number,
  ) {
    return this.reviewsService.findAll({ produtoId, usuarioId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.reviewsService.update(id, dto, usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') usuarioId: number,
  ) {
    return this.reviewsService.remove(id, usuarioId);
  }
}
