import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { BusinessSettings } from '../types';
import { ShieldAlert, Instagram, Facebook, MapPin, Phone, ShieldCheck, X } from 'lucide-react';

interface FooterProps {
  settings: BusinessSettings;
  onOpenBooking: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBooking,
  onNavigateToSection
}) => {
  const { language, isRTL, t } = useLanguage();
  const { activeConfig } = useBrand();
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'cancellation' | null>(null);

  return (
    <footer className="bg-[#542238] text-[#FAF5F0] pt-16 pb-12 border-t border-[#6E304B] text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-serif text-2xl tracking-widest text-[#FAF5F0] font-medium block">
                VELMORA
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#C58B83] uppercase font-sans font-medium block">
                {isRTL ? 'عيادة التجميل والعناية بالبشرة' : 'AESTHETICS & BEAUTY'}
              </span>
            </div>
            <p className="text-xs text-[#E2CFD8] leading-relaxed">
              {t('brand.tagline')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#6E304B] hover:bg-[#C58B83] hover:text-[#542238] text-[#FAF5F0] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#6E304B] hover:bg-[#C58B83] hover:text-[#542238] text-[#FAF5F0] flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#C58B83] font-semibold">
              {isRTL ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-[#E2CFD8]">
              <li>
                <button
                  onClick={() => onNavigateToSection('hero')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('services')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.services')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('about')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('specialists')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.specialists')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('gallery')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('offers')}
                  className="hover:text-[#FAF5F0] transition-colors cursor-pointer"
                >
                  {t('nav.offers')}
                </button>
              </li>
            </ul>
          </div>

          {/* Branches */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#C58B83] font-semibold">
              {isRTL ? 'مواقع العيادات بمصر' : 'Clinic Locations'}
            </h4>
            <div className="space-y-2.5 text-xs text-[#E2CFD8]">
              <div className="space-y-0.5">
                <span className="font-semibold text-[#FAF5F0] block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C58B83]" />
                  {isRTL ? 'مدينة 6 أكتوبر' : '6th of October City'}
                </span>
                <p className="text-[11px] text-[#CBB6C1]">
                  {language === 'ar' ? settings.octoberAddressAr : settings.octoberAddressEn}
                </p>
              </div>
              <div className="space-y-0.5 pt-1">
                <span className="font-semibold text-[#FAF5F0] block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C58B83]" />
                  {isRTL ? 'الشيخ زايد' : 'Sheikh Zayed City'}
                </span>
                <p className="text-[11px] text-[#CBB6C1]">
                  {language === 'ar' ? settings.zayedAddressAr : settings.zayedAddressEn}
                </p>
              </div>
            </div>
          </div>

          {/* Working hours & Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#C58B83] font-semibold">
              {t('contact.hours')}
            </h4>
            <p className="text-xs text-[#E2CFD8] leading-relaxed">
              {language === 'ar' ? settings.openingHoursAr : settings.openingHoursEn}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 px-4 bg-[#C58B83] hover:bg-[#B37971] text-white font-medium text-xs rounded-md transition-colors cursor-pointer shadow-xs"
              >
                {t('nav.bookNow')}
              </button>
            </div>
          </div>

        </div>

        {/* Mandatory Medical Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#3F192A] border border-[#6E304B] space-y-2 text-start">
          <div className="flex items-center gap-2 text-[#C58B83]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              {t('footer.disclaimerTitle')}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#E2CFD8] leading-relaxed">
            {t('footer.disclaimerText')}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#2F2B24] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#857D71]">
          <div>
            {language === 'ar'
              ? (activeConfig.footerCopyrightAr || t('footer.rights'))
              : (activeConfig.footerCopyrightEn || t('footer.rights'))}
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActivePolicyModal('privacy')}
              className="hover:text-[#EDE7DE] transition-colors cursor-pointer underline underline-offset-4"
            >
              {t('footer.privacy')}
            </button>
            <button
              onClick={() => setActivePolicyModal('cancellation')}
              className="hover:text-[#EDE7DE] transition-colors cursor-pointer underline underline-offset-4"
            >
              {t('footer.cancellation')}
            </button>
          </div>
        </div>

      </div>

      {/* Policy Modals */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF7F2] text-[#222222] rounded-xl max-w-lg w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl relative text-start">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {activePolicyModal === 'privacy' ? t('footer.privacy') : t('footer.cancellation')}
              </h3>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-1 text-[#786F62] hover:text-[#1F1C18] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-[#574F42] leading-relaxed space-y-3 max-h-80 overflow-y-auto">
              {activePolicyModal === 'privacy' ? (
                <>
                  <p>
                    {isRTL
                      ? 'تلتزم عيادة ڤيلمورا بحماية خصوصية عملائها التامة. لا نجمع سوى البيانات الأساسية الضرورية للتواصل والتنسيق الطبي (الاسم ورقم الهاتف).'
                      : 'VELMORA Aesthetics respects client privacy. We minimize data collection strictly to essential contact information (name and phone number) necessary for appointment scheduling.'}
                  </p>
                  <p>
                    {isRTL
                      ? 'لا تتم مشاركة أرقام الهواتف أو البيانات الشخصية مع أي جهات خارجية أو تسويقية على الإطلاق. تُحفظ السجلات الطبية وفق المعايير الإكلينيكية المعمول بها في جمهورية مصر العربية.'
                      : 'Contact details are never sold or shared with external marketing parties. Medical records are preserved strictly under Egyptian clinical confidentiality standards.'}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {language === 'ar'
                      ? settings.cancellationPolicyAr
                      : settings.cancellationPolicyEn}
                  </p>
                  <p>
                    {isRTL
                      ? 'نظراً لأن أوقات الأطباء وجلسات التعقيم مخصصة لكل عميل، نقدر إبلاغنا في أقرب فرصة عند الرغبة في إعادة جدولة الموعد.'
                      : 'Because medical rooms and sterile instruments are allocated specifically per consultation, we kindly request timely notice if rescheduling is needed.'}
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 text-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 bg-[#1F1C18] text-[#FAF7F2] rounded-md text-xs font-medium"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
