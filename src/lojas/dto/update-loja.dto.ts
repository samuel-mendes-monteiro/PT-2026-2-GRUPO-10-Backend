import { PartialType } from '@nestjs/mapped-types';
import { CreateLojaDto } from './create-loja.dto.js';

export class UpdateLojaDto extends PartialType(CreateLojaDto) {}
