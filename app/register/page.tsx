"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSmartlocStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter."),
  email: z.string().email("Masukkan email yang valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: z.enum(["admin", "user"])
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useSmartlocStore((state) => state.register);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "user" }
  });
  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    const result = await registerUser({ ...data, role: data.role as Role });
    if (!result.ok) return toast.error(result.message);
    toast.success("Akun berhasil dibuat. Silakan login terlebih dahulu.");
    router.push(data.role === "admin" ? "/login/admin" : "/login/user");
  };

  return (
    <AuthShell
      eyebrow="Buat Akun"
      title="Mulai Petakan Peluang."
      footer={<>Sudah punya akun? <Link href="/login" className="font-bold text-sea hover:underline">Masuk</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Field label="Nama Lengkap" error={errors.name?.message}>
          <Input placeholder="Nama Anda" {...register("name")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="nama@email.com" {...register("email")} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="Minimal 6 karakter" {...register("password")} />
        </Field>
        <Field label="Jenis Akun" hint={role === "admin" ? "Akun admin tersedia untuk kebutuhan demonstrasi." : "Pengguna dapat melihat ranking dan menjelajahi peta."}>
          <div className="grid grid-cols-2 gap-3">
            {(["user", "admin"] as Role[]).map((item) => (
              <label key={item} className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-bold transition ${role === item ? "border-sea bg-sea/5 text-sea ring-2 ring-sea/10" : "border-ocean/10 text-ink/45"}`}>
                <input type="radio" value={item} className="sr-only" {...register("role")} />
                {item === "user" ? "Pengguna" : "Admin"}
              </label>
            ))}
          </div>
        </Field>
        <Button type="submit" className="mt-1 w-full"><UserPlus className="h-4 w-4" /> Buat Akun</Button>
      </form>
    </AuthShell>
  );
}
