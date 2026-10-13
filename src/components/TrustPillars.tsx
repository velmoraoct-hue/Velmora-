import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, HeartHandshake, FileCheck2, Sparkles } from 'lucide-react';

export const TrustPillars: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: ShieldCheck,
      title: t('trust.pillar1.title'),
      desc: t('trust.pillar1.desc'),
    },
    {
      icon: Sparkles,
      title: t('trust.pillar2.title'),
      desc: t('trust.pillar2.desc'),
    },
    {
      icon: FileCheck2,
      title: t('trust.pillar3.title'),
      desc: t('trust.pillar3.desc'),
    },
    {
      icon: HeartHandshake,
      title: t('trust.pillar4.title'),
      desc: t('trust.pillar4.desc'),
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F3ECE2]/60 border-y border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
            VELMORA ETHICS & QUALITY
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal">
            {t('trust.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#686053]">
            {t('trust.subtitle')}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF7F2] p-6 sm:p-7 rounded-xl border border-[#E5DAC8] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 space-y-4 text-start flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-lg bg-[#F0E5D4] flex items-center justify-center text-[#99783D]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-medium text-[#1F1C18]">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D5547] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="w-8 h-0.5 bg-[#C5A265]/40 rounded-full"></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
