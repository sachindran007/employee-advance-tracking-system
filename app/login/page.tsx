import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && isAdminEmail(user.email)) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <LoginForm message={params.message} />
    </div>
  );
}
