import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Public } from '../auth/decorators/isPublic.decorator.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Filtros opcionais: ?raiz=true (só categorias raiz, já com as filhas) e ?nome=Eletrônicos
  @Public()
  @Get()
  findAll(@Query('raiz') raiz?: string, @Query('nome') nome?: string) {
    return this.categoriesService.findAll({ raiz: raiz === 'true', nome });
  }

  // IMPORTANTE: precisa ficar ANTES de @Get(':id'),
  // senão "opcoes" seria interpretado como um id.
  @Get('opcoes')
  findOpcoes() {
    return this.categoriesService.findOpcoes();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}