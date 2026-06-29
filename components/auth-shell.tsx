"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "./logo";

export function AuthShell({ title, eyebrow, children, footer }: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#fffdf2] lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative flex flex-col px-6 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink/50 hover:text-sea">
            <ArrowLeft className="h-4 w-4" /> Beranda
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <div className="text-[10px] font-black uppercase tracking-[.22em] text-coral">{eyebrow}</div>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ocean">{title}</h1>
          <div className="mt-8">{children}</div>
          <div className="mt-7 text-center text-xs text-ink/50">{footer}</div>
        </div>
      </section>
      <aside className="topography relative hidden overflow-hidden p-12 text-ink lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 coordinate-grid opacity-20" />
        <div className="relative flex justify-end font-data text-[9px] uppercase tracking-[.22em] text-ink/45">
          1.4748° N / 124.8421° E
        </div>
        <div className="relative max-w-xl">
          <div className="mb-5 h-1 w-20 rounded-full bg-ink" />
          <blockquote className="font-serif text-4xl font-bold leading-tight">
            “Keputusan yang baik bukan tebakan. Ia adalah pola yang berhasil kita lihat.”
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-5 text-[11px] font-bold text-ink/65">
            {["5 kriteria", "2 metode", "1 peta keputusan"].map((item) => (
              <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-ink" /> {item}</span>
            ))}
          </div>
        </div>
        <div className="relative text-[10px] uppercase tracking-[.18em] text-ink/45">SMARTLOC / 2026</div>
      </aside>
    </main>
  );
}
