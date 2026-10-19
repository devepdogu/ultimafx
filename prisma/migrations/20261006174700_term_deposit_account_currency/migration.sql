-- Moved here from 20261006120000_usd_wallet_term_deposits, which ran before TermDepositAccount
-- existed (that table is created above, in 20261006174635_term_deposit_accounts). Same statement,
-- just placed after its dependency so a from-scratch `prisma migrate deploy` applies cleanly.
ALTER TABLE "TermDepositAccount" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY';
