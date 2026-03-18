"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signInAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm({ message }: { message?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      const result = await signInAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {message ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {message}
            </div>
          ) : null}

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...form.register("email", { required: true })}
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...form.register("password", { required: true })}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
