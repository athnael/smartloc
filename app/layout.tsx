import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@fontsource-variable/manrope";
import "@fontsource-variable/sora";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMARTLOC — Peta Keputusan Lokasi Usaha Manado",
  description: "Sistem pendukung keputusan lokasi usaha di Kota Manado dengan metode SMART dan SAW."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
