import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Offer } from '../types';
import { Sparkles, Tag, Calendar, Check } from 'lucide-react';

interface OffersSectionProps {
  offers: Offer[];
  onSelectOfferForBooking: (offer: Offer) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  offers,
  onSelectOfferForBooking
}) => {
  const { language, isRTL } = useLanguage();

  const activeOffers = offers.filter((o) => o.isActive);
  if (activeOffers.length === 0) return null;

  return (
    <section id="offers" className="py-16 sm:py-20 bg-[#F3ECE2]/60 border-t border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
            CURATED SEASONAL PACKAGES
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal">
            {isRTL ? 'باقات وعروض العناية المتكاملة' : 'Signature Packages & Curated Offers'}
          </h2>
          <p className="text-sm sm:text-base text-[#686053]">
            {isRTL
              ? 'بروتوكولات علاجية مجمعة تمنحكِ أقصى فائدة علاجية وتوفيراً واضحاً في السعر'
              : 'Synergistic treatment protocols crafted to maximize radiant clinical results'}
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {activeOffers.map((offer) => {
            const title = language === 'ar' ? offer.titleAr : offer.titleEn;
            const desc = language === 'ar' ? offer.descriptionAr : offer.descriptionEn;
            const savings = offer.originalPriceEgp - offer.discountPriceEgp;

            return (
              <div
                key={offer.id}
                className="bg-[#FAF7F2] rounded-xl border border-[#DECDB8] p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between text-start relative overflow-hidden"
              >
                {/* Savings Pill */}
                {savings > 0 && (
                  <div className="absolute top-4 left-4 bg-[#8A714C] text-[#FAF7F2] text-[11px] font-semibold px-2.5 py-1 rounded">
                    {isRTL ? `وفري ${savings} ج.م` : `Save ${savings} EGP`}
                  </div>
                )}

                <div className="space-y-4 pt-4 sm:pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#8A714C]">
                    <Tag className="w-4 h-4" />
                    <span>{isRTL ? 'باقة متكاملة' : 'Curated Protocol'}</span>
                  </div>

                  <h3 className="text-xl font-serif font-medium text-[#1F1C18]">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5D5547] leading-relaxed">
                    {desc}
                  </p>

                  <div className="p-3 bg-[#F3ECE2] rounded-lg border border-[#E5DAC8] text-xs text-[#4A4337] space-y-1">
                    <span className="font-semibold block">
                      {isRTL ? 'الجلسات المشمولة في الباقة:' : 'Included Treatments:'}
                    </span>
                    <p className="text-[#645B4E]">{offer.servicesIncluded}</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E8DEC8] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#7A7162] line-through block">
                      {offer.originalPriceEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#1F1C18]">
                      {offer.discountPriceEgp.toLocaleString()}{' '}
                      <span className="text-xs font-sans font-normal text-[#8A714C]">
                        {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectOfferForBooking(offer)}
                    className="px-5 py-2.5 bg-[#1F1C18] hover:bg-[#342E26] text-[#FAF7F2] text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer"
                  >
                    {isRTL ? 'احجزي هذه الباقة' : 'Book Package'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
