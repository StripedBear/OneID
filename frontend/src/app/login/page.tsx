"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TokenResponse } from "@/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      const data = await api<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(values) });
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Ошибка входа");
    }
  };

  return (
    <div className="max-w-md mx-auto grid gap-4">
      <h1 className="text-2xl font-semibold">{t("login_title")}</h1>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <input placeholder={t("login_email")} className="input" {...register("email")} />
        {errors.email && <p className="err">{errors.email.message}</p>}

        <input placeholder={t("login_password")} type="password" className="input" {...register("password")} />
        {errors.password && <p className="err">{errors.password.message}</p>}

        <button disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Вхожу..." : t("login_submit")}</button>
      </form>
      <style jsx>{`
        .input { background:#0b1220; border:1px solid #1f2937; border-radius:14px; padding:10px 14px; }
        .btn-primary { background:white; color:#0b1220; border-radius:14px; padding:10px 14px; }
        .err { color:#fda4af; font-size:12px; }
      `}</style>
    </div>
  );
}
