import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { Public } from '../auth/decorators/isPublic.decorator.js';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator.js';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('sub') userId: number,
  ) {
    if (id !== userId) {
      throw new ForbiddenException('Você só pode alterar o seu próprio usuário');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    if (id !== userId) {
      throw new ForbiddenException('Você só pode apagar o seu próprio usuário');
    }
    return this.userService.remove(id);
  }
}
