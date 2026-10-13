import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Award, MapPin } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  const { isRTL, t } = useLanguage();

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-[#FAF5F0]">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B69AA8]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#C58B83]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-start">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5F0] border border-[#C58B83]/40 text-xs font-medium text-[#542238] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#C58B83]" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#1F1C18] leading-[1.2] tracking-tight font-normal">
                {isRTL ? (
                  <>
                    جمالكِ الطبيعي بأيدٍ <span className="italic font-serif text-[#542238] font-medium">طبية موثوقة</span>
                  </>
                ) : (
                  <>
                    Natural Enhancement in <span className="italic font-serif text-[#542238] font-medium">Trusted Medical</span> Hands
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg text-[#5A4E54] leading-relaxed max-w-2xl font-normal">
                {t('hero.desc')}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="flex items-center justify-center gap-3 px-7 py-3.5 bg-[#542238] hover:bg-[#3F192A] text-[#FAF5F0] font-medium rounded-md shadow-md hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer border border-[#542238]"
              >
                <Calendar className="w-4 h-4 text-[#C58B83]" />
                <span>{t('hero.ctaBooking')}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4 text-[#C58B83]" /> : <ArrowRight className="w-4 h-4 text-[#C58B83]" />}
              </button>

              <button
                onClick={onExploreServices}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/90 hover:bg-[#FAF5F0] text-[#1F1C18] font-medium rounded-md border border-[#E8DCD5] transition-all text-sm sm:text-base cursor-pointer shadow-xs"
              >
                <span>{t('hero.ctaServices')}</span>
              </button>
            </div>

            {/* Trust highlights bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E8DEC8]/80 text-start">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-serif text-[#1F1C18] font-medium">100%</div>
                <div className="text-xs text-[#736B5E]">{t('hero.statYears')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-serif text-[#1F1C18] font-medium">EGP</div>
                <div className="text-xs text-[#736B5E]">{isRTL ? 'أسعار شفافة دون مفاجآت' : 'Transparent Pricing'}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <div className="text-xl sm:text-2xl font-serif text-[#1F1C18] font-medium">2</div>
                <div className="text-xs text-[#736B5E]">{t('hero.statBranches')}</div>
              </div>
            </div>

            {/* Location Pill */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#736B5E]">
              <span className="font-medium text-[#4A4337] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C5A265]" />
                {isRTL ? 'الفروع المعتمدة:' : 'Clinic Locations:'}
              </span>
              <span className="bg-[#F3ECE2] px-2.5 py-1 rounded text-[#574E40] border border-[#E4D9C8]">
                {isRTL ? 'مدينة 6 أكتوبر (المحور المركزي)' : '6th of October City (Central Axis)'}
              </span>
              <span className="bg-[#F3ECE2] px-2.5 py-1 rounded text-[#574E40] border border-[#E4D9C8]">
                {isRTL ? 'الشيخ زايد (وصلة دهشور)' : 'Sheikh Zayed (Dahshur Link)'}
              </span>
            </div>

          </div>

          {/* Luxury Editorial Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer elegant frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-4/5 bg-[#E8DEC8]">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85"
                  alt="VELMORA Aesthetic & Skincare Treatment"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1C18]/60 via-transparent to-transparent"></div>

                {/* Overlaid luxury tag */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#FAF7F2]/90 backdrop-blur-md border border-white/60 shadow-lg text-start">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-[#8A714C] font-semibold">
                        VELMORA CLINICAL STANDARDS
                      </div>
                      <div className="text-sm font-serif font-medium text-[#1F1C18]">
                        {isRTL ? 'رعاية إكلينيكية متخصصة ونتائج طبيعية' : 'Dermatologist Guided Protocols'}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#A88756]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative accent card */}
              <div className="hidden sm:block absolute -top-5 -left-5 bg-[#FAF7F2] border border-[#E0D4C3] p-3.5 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A4337]">
                  <Award className="w-4 h-4 text-[#C5A265]" />
                  <span>{isRTL ? 'مرخص رسمياً بمصر' : 'Licensed Clinical Protocols'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
