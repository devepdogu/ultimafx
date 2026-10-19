-- AlterEnum
ALTER TYPE "WalletTransactionType" ADD VALUE 'FX_CONVERSION';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "usdBalance" DECIMAL(24,6) NOT NULL DEFAULT 0;

-- Note: this migration originally also added TermDepositAccount.currency here, but that table
-- isn't created until the later 20261006174635_term_deposit_accounts migration — applying this
-- file's statements strictly in order (as `prisma migrate deploy` does on a fresh database) failed
-- with "relation TermDepositAccount does not exist". That ALTER TABLE was moved to
-- 20261006174700_term_deposit_account_currency, which runs right after the table is created. The
-- resulting schema is unchanged; only the step order was fixed.

