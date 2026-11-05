"use client";

import { useActionState } from "react";

import { Field, FormError, SubmitButton } from "@/components/form";

import { registerAction } from "../actions";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, undefined);
  const errors = state?.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state?.error} />
      <Field
        label="Аты-жөні"
        name="name"
        autoComplete="name"
        required
        defaultValue={state?.values?.name}
        error={errors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={errors?.email}
      />
      <Field
        label="Құпиясөз"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        error={errors?.password}
      />
      <Field
        label="Құпиясөзді қайталаңыз"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={errors?.confirmPassword}
      />
      <SubmitButton pendingText="Тіркелуде…">Тіркелу</SubmitButton>
    </form>
  );
}
