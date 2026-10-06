-- AlterTable
ALTER TABLE "KycDocument" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING';

