const points = [
  { name: "Megamas", score: "0,856", x: "32%", y: "48%", rank: 2 },
  { name: "Paal Dua", score: "0,883", x: "62%", y: "40%", rank: 1 },
  { name: "Malalayang", score: "0,742", x: "21%", y: "73%", rank: 3 },
  { name: "Mapanget", score: "0,718", x: "76%", y: "18%", rank: 4 }
];

export function LandingMap() {
  return (
    <div className="map-grid relative h-[440px] overflow-hidden rounded-[2rem] border border-white/70 shadow-float">
      <div className="absolute left-5 top-5 z-10 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-sea shadow-sm backdrop-blur">
        1.4748° N · 124.8421° E
      </div>
      {points.map((point) => (
        <div key={point.name} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: point.x, top: point.y }}>
          <div className="group relative">
            <div className="grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-coral text-xs font-black text-white shadow-lg transition-transform group-hover:scale-110">
              {point.rank}
            </div>
            <div className="absolute left-1/2 top-11 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-ocean shadow group-hover:block">
              {point.name} · {point.score}
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 right-5 z-10 font-data text-[9px] uppercase tracking-widest text-ocean/50">
        Kota Manado / Sulawesi Utara
      </div>
    </div>
  );
}
