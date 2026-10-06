-- CreateTable
CREATE TABLE "TermDepositProduct" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "termDays" INTEGER NOT NULL,
    "annualRate" DECIMAL(8,4) NOT NULL,
    "minAmount" DECIMAL(20,2) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermDepositProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TermDepositProduct_isActive_currency_position_idx" ON "TermDepositProduct"("isActive", "currency", "position");

