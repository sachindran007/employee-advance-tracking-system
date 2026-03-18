import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/unauthorized");
  }

  return { supabase, user };
}
