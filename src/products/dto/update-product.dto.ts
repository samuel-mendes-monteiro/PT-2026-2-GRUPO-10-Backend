import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.js';

// Na edição todos os campos são opcionais e a loja NÃO pode ser trocada
// (um produto não "muda de dono").
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['lojaId'] as const),
) {}
