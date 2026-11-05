import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LojasService } from './lojas.service.js';
import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';

@Controller('lojas')
export class LojasController {
  constructor(private readonly lojasService: LojasService) {}

  @Post()
  create(@Body() createLojaDto: CreateLojaDto, @Req() req: any) {

    const usuarioId = req.user.sub || req.user.id; 
    return this.lojasService.create(createLojaDto, usuarioId);
  }

  @Get()
  findAll() {
    return this.lojasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lojasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLojaDto: UpdateLojaDto, @Req() req: any) {
    const usuarioId = req.user.sub || req.user.id;
    return this.lojasService.update(+id, updateLojaDto, usuarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuarioId = req.user.sub || req.user.id;
    return this.lojasService.remove(+id, usuarioId);
  }
}
