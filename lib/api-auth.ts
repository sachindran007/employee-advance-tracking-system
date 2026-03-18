import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminEmail(user.email)) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    };
  }

  return { user };
}
