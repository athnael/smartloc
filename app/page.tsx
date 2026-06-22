import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Compass, Map, Scale, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { LandingMap } from "@/components/landing-map";
import { LandingMediaShowcase } from "@/components/landing-media-showcase";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf2]">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 text-xs font-bold text-ink/60 md:flex">
          <a href="#galeri" className="hover:text-sea">Galeri</a>
          <a href="#cara-kerja" className="hover:text-sea">Cara kerja</a>
          <a href="#metode" className="hover:text-sea">Metode</a>
          <a href="#tentang" className="hover:text-sea">Tentang</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>Masuk</Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>Mulai Sekarang <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </header>

      <section className="coordinate-grid relative mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="absolute -right-52 -top-60 h-[520px] w-[520px] rounded-full bg-land/45 blur-3xl" />
        <div className="relative grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sea/15 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[.17em] text-sea shadow-sm">
              <Compass className="h-3.5 w-3.5" /> Sistem keputusan lokasi usaha
            </div>
            <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[.98] tracking-[-.045em] text-ocean sm:text-6xl lg:text-[78px]">
              Tempat yang tepat, <span className="italic text-sea">terlihat</span> dari datanya.
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-ink/60 sm:text-base">
              SMARTLOC membantu pelaku usaha di Manado membandingkan potensi lokasi secara objektif—dari kepadatan penduduk hingga biaya sewa—dalam satu atlas keputusan.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "coral" }))}>
                Temukan Lokasi Terbaik <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>Lihat demo</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[11px] font-bold text-ink/50">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-land" /> Data transparan</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-land" /> SMART & SAW</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-land" /> Peta interaktif</span>
            </div>
          </div>
          <LandingMap />
        </div>
      </section>

      <LandingMediaShowcase />

      <section id="cara-kerja" className="overflow-hidden bg-gradient-to-br from-land via-[#ffbd13] to-coral px-5 py-16 text-ink sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl min-w-0">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-12">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-coral sm:tracking-[.24em]">Dari data ke keputusan</div>
              <h2 className="mt-4 max-w-full break-words font-serif text-[30px] font-bold leading-[1.12] tracking-[-.03em] text-ocean sm:text-4xl lg:text-5xl">
                Lima Pertimbangan Untuk Memilih Lokasi Terbaik.
              </h2>
            </div>
            <div className="grid min-w-0 gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-3">
              {[
                { icon: BarChart3, title: "Baca potensi", text: "Lihat data penduduk, area, jarak, sewa, dan persaingan." },
                { icon: Scale, title: "Bandingkan metode", text: "Uji hasil dengan SMART atau SAW dalam sekali klik." },
                { icon: Map, title: "Jelajahi peta", text: "Hubungkan skor dengan konteks lokasi sebenarnya." }
              ].map((item) => (
                <article key={item.title} className="min-w-0 bg-white/45 p-6 backdrop-blur-sm sm:p-7">
                  <item.icon className="h-6 w-6 text-ocean" />
                  <h3 className="mt-10 font-serif text-xl font-bold text-ocean sm:mt-14">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-ink/70 sm:text-xs">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="metode" className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 sm:gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-orange-200 bg-sand p-6 shadow-sm sm:p-10">
            <span className="font-data text-xs font-black text-coral">01 / SMART</span>
            <h2 className="mt-8 font-serif text-3xl font-bold leading-tight text-ocean sm:mt-14 sm:text-4xl">Nilai Manfaat Yang Mudah Dibaca.</h2>
            <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-ink/70 sm:text-base">Setiap lokasi dinilai berdasarkan utility dan bobot prioritas. Cocok untuk memahami kontribusi tiap kriteria terhadap skor akhir.</p>
          </div>
          <div className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm sm:p-10">
            <span className="font-data text-xs font-black text-sea">02 / SAW</span>
            <h2 className="mt-8 font-serif text-3xl font-bold leading-tight text-ocean sm:mt-14 sm:text-4xl">Pembanding Yang Lugas Dan Terukur.</h2>
            <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-ink/70 sm:text-base">Normalisasi benefit dan cost memberi sudut pandang kedua agar keputusan lokasi tidak bertumpu pada satu metode saja.</p>
          </div>
        </div>
      </section>

      <footer id="tentang" className="border-t border-ocean/10 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink/45">
            <ShieldCheck className="h-4 w-4 text-land" /> Prototipe keputusan lokasi Kota Manado
          </div>
        </div>
      </footer>
    </main>
  );
}
