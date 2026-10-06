-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kvkkAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tcKimlikHash" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_tcKimlikHash_key" ON "User"("tcKimlikHash");

