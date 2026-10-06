-- CreateTable
CREATE TABLE "InvestmentFund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "risk" INTEGER NOT NULL,
    "unitPrice" DECIMAL(18,6),
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "ytdReturn" DECIMAL(8,2),
    "oneYearReturn" DECIMAL(8,2),
    "aum" DECIMAL(20,2),
    "investorCount" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentFund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestmentFund_isActive_position_idx" ON "InvestmentFund"("isActive", "position");

