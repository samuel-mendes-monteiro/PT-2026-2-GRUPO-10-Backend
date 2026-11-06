import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto.js';

export class UpdateProductImageDto extends PartialType(
  OmitType(CreateProductImageDto, ['produtoId'] as const),
) {}
