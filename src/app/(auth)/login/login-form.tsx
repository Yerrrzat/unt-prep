"use client";

import { useActionState } from "react";

import { Field, FormError, SubmitButton } from "@/components/form";

import { loginAction } from "../actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state?.error} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
      />
      <Field
        label="Құпиясөз"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />
      <SubmitButton pendingText="Кіруде…">Кіру</SubmitButton>
    </form>
  );
}
