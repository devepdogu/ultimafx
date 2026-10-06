import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

/** Streams one KYC document to an admin. Anyone else gets 404, so document ids reveal nothing. */
export async function GET(_req: Request, { params }: { params: Promise<{ docId: string }> }) {
  const user = await getCurrentUser();
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!user || !isAdmin) return new Response("Not found", { status: 404 });

  const { docId } = await params;
  const doc = await prisma.kycDocument.findUnique({ where: { id: docId }, select: { data: true, mimeType: true, fileName: true } });
  if (!doc) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
