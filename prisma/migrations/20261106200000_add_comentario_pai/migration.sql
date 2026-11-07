-- AlterTable
ALTER TABLE "comentarios_avaliacao" ADD COLUMN     "comentario_pai_id" INTEGER;

-- CreateIndex
CREATE INDEX "comentarios_avaliacao_comentario_pai_id_idx" ON "comentarios_avaliacao"("comentario_pai_id");

-- AddForeignKey
ALTER TABLE "comentarios_avaliacao" ADD CONSTRAINT "comentarios_avaliacao_comentario_pai_id_fkey" FOREIGN KEY ("comentario_pai_id") REFERENCES "comentarios_avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
