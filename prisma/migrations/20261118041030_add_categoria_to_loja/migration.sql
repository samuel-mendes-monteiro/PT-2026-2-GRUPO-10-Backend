-- AlterTable
ALTER TABLE "lojas" ADD COLUMN     "categoria_id" INTEGER;

-- CreateIndex
CREATE INDEX "lojas_categoria_id_idx" ON "lojas"("categoria_id");

-- AddForeignKey
ALTER TABLE "lojas" ADD CONSTRAINT "lojas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
