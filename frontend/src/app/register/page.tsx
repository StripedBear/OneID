"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify(values) });
      router.push("/login");
    } catch (e: any) {
      setError(e.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="max-w-md mx-auto grid gap-4">
      <h1 className="text-2xl font-semibold">{t("register_title")}</h1>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <input placeholder={t("login_email")} className="input" {...register("email")} />
        {errors.email && <p className="err">{errors.email.message}</p>}

        <input placeholder="Username" className="input" {...register("username")} />
        {errors.username && <p className="err">{errors.username.message}</p>}

        <input placeholder="Отображаемое имя (опц.)" className="input" {...register("display_name")} />
        <input placeholder="Avatar URL (опц.)" className="input" {...register("avatar_url")} />
        <textarea placeholder="Bio (опц.)" className="input" rows={3} {...register("bio")} />

        <input placeholder={t("login_password")} type="password" className="input" {...register("password")} />
        {errors.password && <p className="err">{errors.password.message}</p>}

        <button disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Создаю..." : t("register_submit")}</button>
      </form>

      <style jsx>{`
        .input { background:#0b1220; border:1px solid #1f2937; border-radius:14px; padding:10px 14px; }
        .btn-primary { background:white; color:#0b1220; border-radius:14px; padding:10px 14px; }
        .err { color:#fda4af; font-size:12px; }
      `}</style>
    </div>
  );
}
