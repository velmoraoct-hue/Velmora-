import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Service, ServiceCategory } from '../types';
import { Clock, AlertCircle, Calendar, Search, Sparkles, Filter } from 'lucide-react';

interface ServicesCatalogProps {
  services: Service[];
  onSelectServiceForBooking: (serviceId: string) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  services,
  onSelectServiceForBooking
}) => {
  const { language, isRTL, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: t('services.cat.all') },
    { id: 'skincare', label: t('services.cat.skincare') },
    { id: 'injectables', label: t('services.cat.injectables') },
    { id: 'peeling', label: t('services.cat.peeling') },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // Must be published
      if (s.status !== 'published') return false;

      // Category filter
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNameAr = s.nameAr.toLowerCase().includes(query);
        const matchesNameEn = s.nameEn.toLowerCase().includes(query);
        const matchesDesc = (s.descriptionAr + s.descriptionEn).toLowerCase().includes(query);
        return matchesNameAr || matchesNameEn || matchesDesc;
      }

      return true;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
            TREATMENT MENU & INDICATIVE PRICING
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal">
            {t('services.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#686053]">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#E8DEC8]">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#1F1C18] text-[#FAF7F2] border-[#1F1C18] shadow-xs'
                    : 'bg-[#F3ECE2] text-[#4A4337] border-[#E2D5C3] hover:bg-[#EAE0D1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث عن علاج أو جلسة...' : 'Search treatment...'}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#D8CBB7] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#A88756] text-[#2F2A22]"
            />
            <Search className={`w-4 h-4 text-[#8C8375] absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'}`} />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-[#F3ECE2]/40 rounded-xl border border-dashed border-[#D5C7B2]">
            <p className="text-sm text-[#736A5B]">
              {isRTL ? 'لا توجد خدمات مطابقة لمعايير البحث الحالية.' : 'No services found matching current filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => {
              const displayName = language === 'ar' ? service.nameAr : service.nameEn;
              const displayDesc = language === 'ar' ? service.descriptionAr : service.descriptionEn;

              return (
                <div
                  key={service.id}
                  className="bg-[#FAF7F2] rounded-xl border border-[#E5DAC8] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Service Image banner */}
                  <div className="relative h-48 overflow-hidden bg-[#EAE0D3]">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F0E5D4] text-[#A88756]">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    )}

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 bg-[#1F1C18]/85 backdrop-blur-xs text-[#FAF7F2] px-2.5 py-1 rounded text-[11px] font-medium tracking-wide">
                      {service.category.toUpperCase()}
                    </div>

                    {/* Price tag */}
                    <div className="absolute bottom-3 right-3 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E0D4C3] px-3 py-1 rounded shadow-xs text-start">
                      <span className="text-[10px] text-[#786F62] block">
                        {service.priceMaxEgp ? (isRTL ? 'السعر التقديري' : 'Price range') : (isRTL ? 'السعر يبدأ من' : 'From')}
                      </span>
                      <span className="text-sm font-serif font-semibold text-[#1F1C18]">
                        {service.priceEgp.toLocaleString()}
                        {service.priceMaxEgp && ` – ${service.priceMaxEgp.toLocaleString()}`}
                        <span className="text-xs font-sans font-normal text-[#8A714C] mx-1">
                          {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between text-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#7A7162]">
                        <Clock className="w-3.5 h-3.5 text-[#C5A265]" />
                        <span>{service.durationMinutes} {t('services.minutes')}</span>
                      </div>

                      <h3 className="text-lg font-serif font-medium text-[#1F1C18] group-hover:text-[#9A7B4F] transition-colors">
                        {displayName}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5C5447] leading-relaxed line-clamp-3">
                        {displayDesc}
                      </p>
                    </div>

                    {/* Medical consultation indicator if applicable */}
                    {service.requiresMedicalConsultation && (
                      <div className="p-2.5 rounded bg-[#F4EDE2] border border-[#E4D7C3] flex items-start gap-2 text-[11px] text-[#695F50]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#A88756] shrink-0 mt-0.5" />
                        <span>{t('services.consultationRequired')}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectServiceForBooking(service.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F3ECE2] hover:bg-[#1F1C18] text-[#3A342B] hover:text-[#FAF7F2] rounded-md font-medium text-xs sm:text-sm transition-all border border-[#DFD3C1] hover:border-[#1F1C18] cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#A88756]" />
                      <span>{t('services.bookThis')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regulatory & Preliminary Price Disclaimer */}
        <div className="mt-12 p-4 rounded-lg bg-[#F3ECE2]/70 border border-[#E4D9C8] text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#736B5E] leading-relaxed">
            {t('services.priceNotice')}
          </p>
        </div>

      </div>
    </section>
  );
};
