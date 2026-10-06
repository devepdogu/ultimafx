import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma/client";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 8): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Returns the user's referral code, creating one on first use. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { referralCode: true } });
  if (user.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const taken = await prisma.user.findUnique({ where: { referralCode: code } });
    if (taken) continue;
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    return code;
  }
  throw new Error("REFERRAL_CODE_GENERATION_FAILED");
}

export async function getReferralStats(userId: string) {
  const invitedCount = await prisma.user.count({ where: { referredById: userId } });
  return { invitedCount };
}
