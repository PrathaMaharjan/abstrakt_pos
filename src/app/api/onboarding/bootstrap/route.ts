// app/api/onboarding/bootstrap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // your Better Auth instance
// import { bootstrapTenant } from "@/db/tenant-service";
import { headers } from "next/headers";
import { bootstrapTenant } from "@/db/onboarding";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tenant = await bootstrapTenant({
    name,
    slug,
    ownerUserId: session.user.id, // pulled from session, not body
  });

  return NextResponse.json(tenant, { status: 201 });
}
