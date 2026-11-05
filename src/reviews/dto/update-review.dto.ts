import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto.js';

// Só dá para editar a nota e o comentário; a avaliação não "muda de produto".
export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['produtoId'] as const),
) {}
