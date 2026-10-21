-- CreateTable
CREATE TABLE "LeverageConfig" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "maxLeverage" INTEGER NOT NULL,
    "contractSize" DECIMAL(20,6) NOT NULL,
    "minLot" DECIMAL(20,6) NOT NULL,
    "spreadPercent" DECIMAL(10,4) NOT NULL,
    "longSwap" DECIMAL(10,4) NOT NULL,
    "shortSwap" DECIMAL(10,4) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeverageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeverageConfig_type_key" ON "LeverageConfig"("type");

