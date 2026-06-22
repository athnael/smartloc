import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Pilih Portal"
      title="Masuk Sesuai Peran Anda."
      footer={<>Pengguna baru? <Link href="/register" className="font-bold text-sea hover:underline">Daftar akun</Link></>}
    >
      <div className="grid gap-4">
        <Link href="/login/user" className="group rounded-2xl border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-coral hover:shadow-float">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-land text-ink"><UserRound className="h-5 w-5" /></div>
          <h2 className="mt-5 font-serif text-xl font-bold text-ocean">Portal Pengguna</h2>
          <p className="mt-2 text-xs leading-5 text-ink/50">Lihat rekomendasi SMART/SAW, perhitungan manual, peta, laporan, dan rekomendasi expert.</p>
        </Link>
        <Link href="/login/admin" className="group rounded-2xl border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-coral hover:shadow-float">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-coral text-white"><ShieldCheck className="h-5 w-5" /></div>
          <h2 className="mt-5 font-serif text-xl font-bold text-ocean">Portal Administrator</h2>
          <p className="mt-2 text-xs leading-5 text-ink/50">Kelola kriteria, alternatif, impor Excel, data expert, pengguna, dan laporan.</p>
        </Link>
      </div>
    </AuthShell>
  );
}
