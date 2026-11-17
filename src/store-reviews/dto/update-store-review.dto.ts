import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStoreReviewDto } from './create-store-review.dto.js';

// Só dá para editar a nota e o comentário; a avaliação não "muda de loja".
export class UpdateStoreReviewDto extends PartialType(
  OmitType(CreateStoreReviewDto, ['lojaId'] as const),
) {}
