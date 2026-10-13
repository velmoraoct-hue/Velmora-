import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Shield, Heart, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { isRTL, t } = useLanguage();

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images Grid */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#EAE0D3] aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1512290903671-17adc8172c3d?auto=format&fit=crop&w=800&q=80"
                  alt="VELMORA Aesthetic Clinic Environment"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping small accent card */}
              <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:-right-8 bg-[#FAF7F2] p-5 rounded-xl border border-[#E0D4C3] shadow-lg max-w-xs text-start">
                <div className="flex items-center gap-2 text-[#99783D] mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? 'معايير سريرية صارمة' : 'Clinical Standards'}
                  </span>
                </div>
                <p className="text-xs text-[#5D5547] leading-relaxed">
                  {isRTL
                    ? 'تعقيم طبي أوروبي، ومستحضرات تجميلية مرخصة من وزارة الصحة المصرية.'
                    : 'Sterile surgical-grade environments with MOH certified medical assets.'}
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-start">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
                OUR PHILOSOPHY & ETHICS
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal leading-tight">
                {t('about.story.title')}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#574F42] leading-relaxed">
              {t('about.story.p1')}
            </p>

            <p className="text-sm sm:text-base text-[#574F42] leading-relaxed">
              {t('about.story.p2')}
            </p>

            {/* Regulatory commitment card */}
            <div className="p-5 rounded-xl bg-[#F3ECE2] border border-[#E2D5C3] space-y-2">
              <div className="flex items-center gap-2 text-[#8A714C]">
                <Shield className="w-5 h-5 text-[#C5A265]" />
                <h3 className="text-sm sm:text-base font-serif font-medium text-[#1F1C18]">
                  {t('about.ethics.title')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#61584A] leading-relaxed">
                {t('about.ethics.desc')}
              </p>
            </div>

            {/* Core Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-white/70 border border-[#E8DEC8]">
                <h4 className="font-serif text-sm font-medium text-[#1F1C18] mb-1">
                  {isRTL ? 'الجمال الطبيعي' : 'Natural Balance'}
                </h4>
                <p className="text-xs text-[#736B5E]">
                  {isRTL ? 'تعزيز الملامح دون تغيير الهوية أو مبالغة.' : 'Enhancing features without exaggerated artificiality.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/70 border border-[#E8DEC8]">
                <h4 className="font-serif text-sm font-medium text-[#1F1C18] mb-1">
                  {isRTL ? 'الأمانة العلمية' : 'Scientific Honesty'}
                </h4>
                <p className="text-xs text-[#736B5E]">
                  {isRTL ? 'تقييم صادق لما تحتاجه بشرتكِ بالفعل.' : 'Truthful assessment of what your skin genuinely requires.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/70 border border-[#E8DEC8]">
                <h4 className="font-serif text-sm font-medium text-[#1F1C18] mb-1">
                  {isRTL ? 'الخصوصية الكاملة' : 'Absolute Privacy'}
                </h4>
                <p className="text-xs text-[#736B5E]">
                  {isRTL ? 'أجنحة استشارة خاصة وهدوء فندقي راقٍ.' : 'Private consultation suites with boutique tranquility.'}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
