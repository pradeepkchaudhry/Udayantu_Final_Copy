import { BookOpen, Clock, Users, ShieldCheck } from "lucide-react";
import { memo } from "react";
import { VERIFIED_PLATFORM_PILLARS } from "@/data/businessTruth";

const PILLAR_ICONS = [BookOpen, Clock, Users, ShieldCheck];

export const StatsSection = memo(() => {
  return (
    <section className="py-14 md:py-16 lg:py-20 bg-gradient-to-r from-primary via-primary/95 to-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_hsl(var(--secondary)/0.15)_0%,_transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_hsl(var(--primary-hover)/0.2)_0%,_transparent_40%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {VERIFIED_PLATFORM_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
            return (
              <div key={pillar.label} className="text-center text-white group">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/15 backdrop-blur-sm mb-3 md:mb-4 group-hover:bg-white/25 transition-all duration-300 border border-white/10">
                  <Icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-1 md:mb-2 tracking-tight">
                  {pillar.metric}
                </div>
                <div className="text-sm md:text-base text-white/90 font-semibold">
                  {pillar.label}
                </div>
                <p className="text-xs text-white/75 mt-1 max-w-[200px] mx-auto">
                  {pillar.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = "StatsSection";
