import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { CMS_TAG, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

/** Called by the admin panel after a save. Verifies the caller is an admin, then purges cached pages. */
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, error: "missing token" }, { status: 401 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || data.user?.app_metadata?.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  revalidateTag(CMS_TAG);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
