import { SignOutButton } from "@/components/layout/sign-out-button";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Unauthorized access</CardTitle>
          <CardDescription>
            This system is restricted to approved admin accounts listed in `ADMIN_EMAILS`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Back to login</Link>
            </Button>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
