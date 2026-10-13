import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { Sparkles, Calendar, Globe, Menu, X, Shield, Phone, MapPin } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: (serviceId?: string) => void;
  onNavigateToSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  currentView: 'public' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onNavigateToSection,
  onOpenAdmin,
  currentView
}) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isStaff, staffRole } = useAuth();
  const { activeConfig } = useBrand();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navLinks = [
    { id: 'hero', label: t('nav.home') },
    { id: 'services', label: t('nav.services') },
    { id: 'about', label: t('nav.about') },
    { id: 'specialists', label: t('nav.specialists') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'offers', label: t('nav.offers') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const handleNavClick = (id: string) => {
    onNavigateToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF5F0]/95 backdrop-blur-md border-b border-[#E8DCD5]/80 transition-all shadow-xs">
      {/* Top micro-announcement bar in Deep Burgundy */}
      <div className="bg-[#542238] text-[#FAF5F0] text-xs py-1.5 px-4 text-center flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 opacity-90">
          <MapPin className="w-3.5 h-3.5 text-[#C5A265]" />
          <span>{isRTL ? 'فرعا مدينة 6 أكتوبر والشيخ زايد' : '6th of October City & Sheikh Zayed Branches'}</span>
        </span>
        <span className="hidden md:inline-block text-[#B69AA8]">•</span>
        <span className="hidden md:flex items-center gap-1.5 opacity-90">
          <Phone className="w-3.5 h-3.5 text-[#C58B83]" />
          <span dir="ltr">+20 102 345 6789</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('hero')}
            className="cursor-pointer flex flex-col items-start select-none group"
          >
            {activeConfig.logoPrimaryUrl ? (
              <img
                src={activeConfig.logoPrimaryUrl}
                alt={activeConfig.brandNameEn}
                style={{ maxHeight: `${activeConfig.logoHeightPx || 38}px` }}
                className="object-contain"
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl tracking-widest text-[#1F1C18] font-medium group-hover:text-[#9A7B4F] transition-colors">
                    {activeConfig.brandNameEn?.split(' ')[0] || 'VELMORA'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A265] inline-block mb-1"></span>
                </div>
                <span className="text-[10px] tracking-[0.25em] text-[#7A7265] uppercase font-sans font-medium -mt-1">
                  {isRTL ? 'عيادة التجميل والعناية بالبشرة' : (activeConfig.brandNameEn?.split(' ').slice(1).join(' ') || 'AESTHETICS & BEAUTY')}
                </span>
              </>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="px-3.5 py-2 text-sm text-[#4A453E] hover:text-[#1F1C18] hover:bg-[#F3ECE2]/80 rounded-md transition-colors font-medium cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F1C18] bg-[#FAF5F0] hover:bg-[#F3EBE3] rounded-md transition-colors border border-[#E8DCD5] cursor-pointer"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-[#C58B83]" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Staff / Admin Portal Toggle */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                currentView === 'admin'
                  ? 'bg-[#542238] text-[#FAF5F0] border-[#542238] shadow-xs'
                  : 'text-[#542238] bg-white/80 hover:bg-[#FAF5F0] border-[#E8DCD5]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C58B83]" />
              <span className="hidden sm:inline">
                {currentView === 'admin' 
                  ? (isRTL ? 'الموقع العام' : 'Public Site')
                  : t('nav.adminPortal')}
              </span>
              {isStaff && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              )}
            </button>

            {/* Main Booking CTA */}
            {currentView === 'public' && (
              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#542238] hover:bg-[#3F192A] text-[#FAF5F0] rounded-md shadow-xs transition-all hover:shadow-md cursor-pointer border border-[#542238]"
              >
                <Calendar className="w-4 h-4 text-[#C58B83]" />
                <span>{t('nav.bookNow')}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#542238] hover:text-[#1F1C18] hover:bg-[#F3EBE3] rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF5F0] border-b border-[#E8DCD5] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-start px-4 py-2.5 text-base text-[#1F1C18] hover:bg-[#F3EBE3] rounded-md transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#E8DCD5] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#542238] hover:bg-[#3F192A] text-[#FAF5F0] rounded-md font-medium text-sm shadow-sm"
            >
              <Calendar className="w-4 h-4 text-[#C58B83]" />
              <span>{t('nav.bookNow')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
