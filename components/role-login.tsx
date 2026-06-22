"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "./auth-shell";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { useSmartlocStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Masukkan email yang valid."),
  password: z.string().min(6, "Password minimal 6 karakter.")
});
type FormData = z.infer<typeof schema>;

export function RoleLogin({ role }: { role: Role }) {
  const router = useRouter();
  const login = useSmartlocStore((state) => state.login);
  const [visible, setVisible] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });
  const isAdmin = role === "admin";

  function useDemo() {
    setValue("email", isAdmin ? "admin@smartloc.id" : "user@smartloc.id");
    setValue("password", isAdmin ? "admin123" : "user123");
  }

  const onSubmit = async (data: FormData) => {
    const user = await login(data.email, data.password, role);
    if (!user) {
      toast.error(`Email atau password akun ${isAdmin ? "admin" : "pengguna"} tidak cocok.`);
      return;
    }
    toast.success(`Selamat datang, ${user.name}.`);
    router.push("/dashboard");
  };

  return (
    <AuthShell
      eyebrow={isAdmin ? "Portal Administrator" : "Portal Pengguna"}
      title={isAdmin ? "Kelola Data Keputusan." : "Temukan Lokasi Terbaik."}
      footer={
        <>
          {isAdmin ? "Bukan administrator?" : "Masuk sebagai admin?"}{" "}
          <Link href={isAdmin ? "/login/user" : "/login/admin"} className="font-bold text-sea hover:underline">
            Buka portal {isAdmin ? "pengguna" : "admin"}
          </Link>
        </>
      }
    >
      <div className="mb-5 rounded-xl border border-orange-200 bg-mist px-4 py-3 text-xs text-ink/65">
        Anda sedang masuk melalui portal <strong>{isAdmin ? "administrator" : "pengguna"}</strong>. Akun dengan peran lain tidak dapat digunakan di halaman ini.
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" placeholder={isAdmin ? "admin@smartloc.id" : "nama@email.com"} autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input type={visible ? "text" : "password"} placeholder="Minimal 6 karakter" autoComplete="current-password" className="pr-11" {...register("password")} />
            <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-sea" aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}>
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <LogIn className="h-4 w-4" /> Masuk Sebagai {isAdmin ? "Admin" : "Pengguna"}
        </Button>
      </form>
      <Button variant="outline" className="mt-4 w-full" onClick={useDemo} type="button">
        Isi Akun Demo {isAdmin ? "Admin" : "Pengguna"}
      </Button>
      {!isAdmin ? (
        <p className="mt-5 text-center text-xs text-ink/50">
          Belum punya akun? <Link href="/register" className="font-bold text-sea hover:underline">Daftar sekarang</Link>
        </p>
      ) : null}
    </AuthShell>
  );
}
