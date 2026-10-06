import { prisma } from "@/lib/prisma/client";
import { hashTcKimlik, normalizePhone } from "./identity";

/** Finds a user by T.C. Kimlik, phone, or (legacy accounts) e-mail. */
export async function findUserByIdentifier(identifier: string) {
  const value = identifier.trim();
  if (/^\d{11}$/.test(value)) {
    return prisma.user.findUnique({
      where: { tcKimlikHash: hashTcKimlik(value) },
      include: { roles: { include: { role: true } } },
    });
  }
  if (value.includes("@")) {
    return prisma.user.findUnique({
      where: { email: value.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
  }
  const phone = normalizePhone(value);
  if (!phone) return null;
  return prisma.user.findUnique({
    where: { phone },
    include: { roles: { include: { role: true } } },
  });
}
