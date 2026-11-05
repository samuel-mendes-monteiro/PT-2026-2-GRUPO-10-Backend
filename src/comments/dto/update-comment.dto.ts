import { PickType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto.js';

// Na edição só o texto muda; o comentário não "muda de avaliação".
export class UpdateCommentDto extends PickType(CreateCommentDto, [
  'conteudo',
] as const) { }
