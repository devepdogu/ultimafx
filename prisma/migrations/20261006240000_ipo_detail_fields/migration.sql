-- AlterTable
ALTER TABLE "IPO" ADD COLUMN     "intermediary" TEXT,
ADD COLUMN     "lotSize" INTEGER,
ADD COLUMN     "maxLotPerUser" INTEGER,
ADD COLUMN     "minAmountTry" DECIMAL(20,2),
ADD COLUMN     "totalDemand" DECIMAL(24,2);

