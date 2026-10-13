import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings } from '../types';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ExternalLink,
  Instagram,
  Facebook,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ContactAndLocationsProps {
  settings: BusinessSettings;
  onOpenBooking: () => void;
}

export const ContactAndLocations: React.FC<ContactAndLocationsProps> = ({
  settings,
  onOpenBooking
}) => {
  const { language, isRTL, t } = useLanguage();
  const [activeBranch, setActiveBranch] = useState<'october' | 'zayed'>('october');

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#branch-zayed' || hash.includes('zayed')) {
        setActiveBranch('zayed');
      } else if (hash === '#branch-october' || hash.includes('october')) {
        setActiveBranch('october');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const cleanWhatsApp = settings.whatsApp.replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#FAF7F2] border-t border-[#E8DEC8] relative">
      <div id="branches" className="absolute -top-24" />
      <div id="branch-zayed" className="absolute -top-24" />
      <div id="branch-october" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
            VISIT OUR CLINICS
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal">
            {t('contact.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#686053]">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Quick Contact Action Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          
          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              language === 'ar'
                ? 'مرحباً عيادة ڤيلمورا، أود الاستفسار عن حجز موعد واستشارة.'
                : 'Hello VELMORA Clinic, I would like to inquire about booking a consultation.'
            )}`}
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-xl bg-[#FAF7F2] border border-[#DFCDB7] hover:border-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center gap-4 text-start group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#786F62] block font-medium">
                {isRTL ? 'خدمة العملاء السريعة' : 'Instant Customer Care'}
              </span>
              <span className="text-sm font-semibold text-[#1F1C18]">
                {t('contact.whatsapp')}
              </span>
              <span className="text-xs text-emerald-800 font-mono block mt-0.5" dir="ltr">
                {settings.whatsApp}
              </span>
            </div>
          </a>

          {/* October Phone */}
          <a
            href={`tel:${settings.phoneOctober.replace(/\s+/g, '')}`}
            className="p-5 rounded-xl bg-[#FAF7F2] border border-[#DFCDB7] hover:border-[#8A714C] hover:bg-[#F3ECE2] transition-all flex items-center gap-4 text-start group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAE0D3] text-[#8A714C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#786F62] block font-medium">
                {t('contact.october')}
              </span>
              <span className="text-sm font-semibold text-[#1F1C18]">
                {t('contact.call')}
              </span>
              <span className="text-xs text-[#8A714C] font-mono block mt-0.5" dir="ltr">
                {settings.phoneOctober}
              </span>
            </div>
          </a>

          {/* Zayed Phone */}
          <a
            href={`tel:${settings.phoneZayed.replace(/\s+/g, '')}`}
            className="p-5 rounded-xl bg-[#FAF7F2] border border-[#DFCDB7] hover:border-[#8A714C] hover:bg-[#F3ECE2] transition-all flex items-center gap-4 text-start group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAE0D3] text-[#8A714C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#786F62] block font-medium">
                {t('contact.zayed')}
              </span>
              <span className="text-sm font-semibold text-[#1F1C18]">
                {t('contact.call')}
              </span>
              <span className="text-xs text-[#8A714C] font-mono block mt-0.5" dir="ltr">
                {settings.phoneZayed}
              </span>
            </div>
          </a>

        </div>

        {/* Branch Details Card with Tabs */}
        <div className="max-w-4xl mx-auto bg-[#FAF7F2] rounded-2xl border border-[#DDCDB8] overflow-hidden shadow-sm">
          
          {/* Branch Switcher Tabs */}
          <div className="flex border-b border-[#E2D5C3] bg-[#F3ECE2]/80">
            <button
              onClick={() => setActiveBranch('october')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                activeBranch === 'october'
                  ? 'bg-[#FAF7F2] text-[#1F1C18] border-b-2 border-[#8A714C] font-semibold'
                  : 'text-[#645B4E] hover:text-[#1F1C18]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#A88756]" />
              <span>{t('contact.october')}</span>
            </button>
            <button
              onClick={() => setActiveBranch('zayed')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                activeBranch === 'zayed'
                  ? 'bg-[#FAF7F2] text-[#1F1C18] border-b-2 border-[#8A714C] font-semibold'
                  : 'text-[#645B4E] hover:text-[#1F1C18]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#A88756]" />
              <span>{t('contact.zayed')}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-start">
            
            {/* Address */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase font-semibold text-[#8A714C] tracking-wider block">
                {isRTL ? 'العنوان الدقيق والتفاصيل' : 'Branch Address & Building'}
              </span>
              <p className="text-base text-[#1F1C18] font-medium leading-relaxed">
                {activeBranch === 'october'
                  ? (language === 'ar' ? settings.octoberAddressAr : settings.octoberAddressEn)
                  : (language === 'ar' ? settings.zayedAddressAr : settings.zayedAddressEn)}
              </p>
            </div>

            {/* Working Hours */}
            <div className="space-y-1.5 pt-2 border-t border-[#EAE0D3]">
              <span className="text-xs uppercase font-semibold text-[#8A714C] tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A265]" />
                {t('contact.hours')}
              </span>
              <p className="text-sm text-[#4E4639]">
                {language === 'ar' ? settings.openingHoursAr : settings.openingHoursEn}
              </p>
            </div>

            {/* Google Maps link & Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <a
                href={activeBranch === 'october' ? settings.googleMapsOctoberUrl : settings.googleMapsZayedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F3ECE2] hover:bg-[#EAE0D1] text-[#342D23] text-xs sm:text-sm font-medium border border-[#DBCAB4] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#8A714C]" />
                <span>{isRTL ? 'فتح الموقع على خرائط Google' : 'Open on Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A714C]" />
              </a>

              <button
                onClick={onOpenBooking}
                className="px-6 py-2.5 bg-[#1F1C18] hover:bg-[#342E26] text-[#FAF7F2] text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer text-center"
              >
                {t('nav.bookNow')}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
