import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'suites' | 'lounge' | 'clinical';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  branchAr: string;
  branchEn: string;
  imageUrl: string;
  featuresAr: string[];
  featuresEn: string[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-vip-suite-zayed',
    category: 'suites',
    titleAr: 'جناح الاستشارة والتقييم السريري VIP',
    titleEn: 'VIP Clinical Consultation Suite',
    descriptionAr: 'جناح استشارة خاص يضمن أعلى درجات السرية والراحة أثناء فحص البشرة ووضع خطة العلاج المخصصة.',
    descriptionEn: 'A private diagnostic sanctuary designed for discreet patient consultations and personalized aesthetic assessments.',
    branchAr: 'فرع الشيخ زايد (وصلة دهشور)',
    branchEn: 'Sheikh Zayed Branch (Dahshur Link)',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['خصوصية صوتية وبصرية تامة', 'إضاءة طبيعية مريحة للعين', 'شاشة عرض تحليلات البشرة'],
    featuresEn: ['Absolute acoustic & visual privacy', 'Ergonomic natural lighting', 'High-definition dermal analysis screen']
  },
  {
    id: 'gal-facial-room-october',
    category: 'suites',
    titleAr: 'جناح العناية بالبشرة والبروتوكولات الأوروبية',
    titleEn: 'Advanced Dermal Treatment Suite',
    descriptionAr: 'مجهز بأحدث أجهزة الهيدرافيشل والديرمابن مع مقاعد طبية استرخائية وموسيقى هادئة لراحة متكاملة.',
    descriptionEn: 'Equipped with hydra-dermabrasion and medical microneedling stations with ambient acoustics for supreme tranquility.',
    branchAr: 'فرع 6 أكتوبر (المحور المركزي)',
    branchEn: '6th of October Branch (Central Axis)',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['أجهزة هيدرافيشل أصلية معتمدة', 'أسرة علاجية طبية قابلة للتعديل', 'تعقيم سطحي بأشعة UV بعد كل جلسة'],
    featuresEn: ['Certified medical hydra systems', 'Fully adjustable ergonomic beds', 'Automated UV-C air sanitation cycle']
  },
  {
    id: 'gal-reception-october',
    category: 'lounge',
    titleAr: 'صالة الاستقبال والضيافة الفندقية الراقية',
    titleEn: 'Reception & Boutique Welcome Lounge',
    descriptionAr: 'تصميم دافئ بألوان العاج والذهب المطفأ لاستقبال هادئ بعيداً عن صخب وتوتر العيادات التقليدية.',
    descriptionEn: 'Warm ivory and champagne brushed gold architectural palette offering a peaceful transition into your treatment.',
    branchAr: 'فرع 6 أكتوبر (المحور المركزي)',
    branchEn: '6th of October Branch (Central Axis)',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['ضيافة مشروبات صحية خالية من السكر', 'خدمة واي فاي خاصة', 'مساعد استقبال مخصص لكل زائرة'],
    featuresEn: ['Artisan wellness refreshments', 'High-speed private Wi-Fi', 'Dedicated personal concierge coordinator']
  },
  {
    id: 'gal-injectables-suite',
    category: 'clinical',
    titleAr: 'جناح الحقن التجميلي السريري المعقم',
    titleEn: 'Sterile Injectables & Medical Procedure Suite',
    descriptionAr: 'جناح طبي مطابق لاشتراطات وزارة الصحة المصرية، مخصص لإجراءات الفيلر والبوتوكس والشد غير الجراحي.',
    descriptionEn: 'Hospital-grade sterile suite strictly adhering to Egyptian health regulations for injectable and lifting procedures.',
    branchAr: 'فرع الشيخ زايد (وصلة دهشور)',
    branchEn: 'Sheikh Zayed Branch (Dahshur Link)',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['إضاءة جراحية باردة بدون ظلال', 'ثلاجة طبية مخصصة لحفظ المستحضرات الحيوية', 'أدوات معقمة ذات استخدام فردي'],
    featuresEn: ['Shadowless surgical cold lighting', 'Calibrated biologics refrigeration', '100% single-use sealed medical instruments']
  },
  {
    id: 'gal-sterilization-lab',
    category: 'clinical',
    titleAr: 'محطة التعقيم المركزي والأوتوكلاف',
    titleEn: 'Central Sterilization & Clean-Room Station',
    descriptionAr: 'بروتوكول تعقيم جراحي صارم عبر أجهزة الأوتوكلاف الحديثة وتغليف معقم مؤرخ لحماية مطلقة من أي عدوى.',
    descriptionEn: 'Rigorous multi-stage sterilization autoclave protocol with date-stamped sealed pouches for zero cross-contamination.',
    branchAr: 'كلا الفرعين (أكتوبر والشيخ زايد)',
    branchEn: 'Both Branches (October & Sheikh Zayed)',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['أجهزة أوتوكلاف كلاس B الأوروبية', 'مؤشرات كيميائية وبيولوجية لضبط التعقيم', 'سجل دوري لفحوصات الجودة الجرثومية'],
    featuresEn: ['European Class-B autoclaves', 'Chemical & biological spore validation', 'Routine certified bacteriological audits']
  },
  {
    id: 'gal-laser-rejuv',
    category: 'suites',
    titleAr: 'جناح التقشير الطبي وتجديد البشرة',
    titleEn: 'Depigmentation & Cellular Renewal Suite',
    descriptionAr: 'أجواء مهدئة ومجهزة لإجراء جلسات التقشير البارد، الإكسوزومز، وترميم حاجز البشرة مع تبريد سطحي فائق.',
    descriptionEn: 'Calming clinical ambiance dedicated to depigmentation peels, exosome regenerative therapy, and epidermal barrier repair.',
    branchAr: 'فرع الشيخ زايد (وصلة دهشور)',
    branchEn: 'Sheikh Zayed Branch (Dahshur Link)',
    imageUrl: 'https://images.unsplash.com/photo-1512290903671-17adc8172c3d?auto=format&fit=crop&w=1200&q=85',
    featuresAr: ['أنظمة تبريد جلدي لتخفيف الإحساس بالحرارة', 'عزل صوتي كامل لاسترخاء تام', 'منتجات ترميم أوروبية مرخصة'],
    featuresEn: ['Cryo dermal cooling comfort systems', 'Acoustic soundproofing', 'Approved European regenerative post-care']
  }
];

/**
 * Reusable image component with native lazy loading and a progressive low-blur placeholder effect
 */
interface LazyBlurImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

const LazyBlurImage: React.FC<LazyBlurImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loading status if src changes (useful for lightbox transitions)
  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  // Generate lightweight low-res placeholder (w=40, q=20) for progressive blur-up
  const placeholderUrl = src.includes('unsplash.com')
    ? src.replace(/w=\d+&q=\d+/, 'w=48&q=20')
    : src;

  return (
    <div className={`relative overflow-hidden bg-[#EAE0D3] ${containerClassName}`}>
      {/* 1. Low-blur micro placeholder */}
      <img
        src={placeholderUrl}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-110 transition-opacity duration-700 pointer-events-none select-none ${
          isLoaded ? 'opacity-0' : 'opacity-90'
        }`}
      />

      {/* 2. Soft luxury shimmer pulse while waiting */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF7F2]/40 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* 3. High-resolution lazy-loaded target image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-xs scale-105'
        } ${className}`}
      />
    </div>
  );
};

interface GallerySectionProps {
  onOpenBooking: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenBooking }) => {
  const { language, isRTL, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'suites' | 'lounge' | 'clinical'>('all');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const filteredItems = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const categories = [
    { id: 'all', label: t('gallery.filter.all') },
    { id: 'suites', label: t('gallery.filter.suites') },
    { id: 'lounge', label: t('gallery.filter.lounge') },
    { id: 'clinical', label: t('gallery.filter.clinical') }
  ];

  // Lightbox navigation helpers
  const handleNext = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex === null) return;
      if (e.key === 'Escape') setSelectedItemIndex(null);
      if (e.key === 'ArrowRight') isRTL ? handlePrev() : handleNext();
      if (e.key === 'ArrowLeft') isRTL ? handleNext() : handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, isRTL, filteredItems.length]);

  const activeModalItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-[#FAF7F2] border-t border-[#E8DEC8] relative overflow-hidden">
      
      {/* Subtle ambient blur ornaments */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#F3ECE2] rounded-full blur-3xl pointer-events-none opacity-50"></div>
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-[#EFE7D8]/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE2] border border-[#E0D4C3] text-xs font-medium text-[#706452]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A265]" />
            <span>{t('gallery.badge')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal tracking-tight">
            {t('gallery.title')}
          </h2>

          <p className="text-sm sm:text-base text-[#645C4E] leading-relaxed">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setSelectedItemIndex(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-[#1F1C18] text-[#FAF7F2] border-[#1F1C18] shadow-xs'
                  : 'bg-[#F3ECE2] text-[#4A4337] border-[#E2D5C3] hover:bg-[#EAE0D1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, index) => {
            const title = language === 'ar' ? item.titleAr : item.titleEn;
            const desc = language === 'ar' ? item.descriptionAr : item.descriptionEn;
            const branch = language === 'ar' ? item.branchAr : item.branchEn;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemIndex(index)}
                className="group relative bg-[#FAF7F2] rounded-2xl border border-[#DECDB8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Lazy Image Container with Blur Placeholder Effect */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#EAE0D3]">
                  <LazyBlurImage
                    src={item.imageUrl}
                    alt={title}
                    containerClassName="w-full h-full"
                    className="group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Subtle Gradient Shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>

                  {/* Branch Pill */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-[#1F1C18]/85 backdrop-blur-md text-[#FAF7F2] px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border border-white/20 z-10 pointer-events-none">
                    <MapPin className="w-3 h-3 text-[#C5A265]" />
                    <span>{branch}</span>
                  </div>

                  {/* Hover Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <span className="w-12 h-12 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md text-[#1F1C18] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="w-5 h-5 text-[#8A714C]" />
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-3 text-start flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-medium text-[#1F1C18] group-hover:text-[#9A7B4F] transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5F574A] leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EAE0D3] flex items-center justify-between text-xs text-[#8A714C] font-medium">
                    <span className="flex items-center gap-1 group-hover:underline">
                      <span>{t('gallery.viewDetails')}</span>
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#C5A265]" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner with Booking Trigger */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#F3ECE2] border border-[#DECDB8] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] uppercase tracking-widest text-[#8A714C] font-semibold block">
              {isRTL ? 'معايير النظافة والخصوصية الفندقية' : 'CLINICAL LUXURY & PRIVACY'}
            </span>
            <h4 className="text-lg sm:text-xl font-serif font-medium text-[#1F1C18]">
              {isRTL ? 'هل تودين حجز جلسة استشارة خاصة في أحد أجنحتنا؟' : 'Ready to experience our private clinical suites?'}
            </h4>
            <p className="text-xs sm:text-sm text-[#645C4E]">
              {isRTL
                ? 'فريق الاستقبال يسعد باستقبالكِ وتخصيص موعد في الجناح الأنسب لراحتكِ.'
                : 'Our guest relations team is dedicated to reserving your preferred treatment room.'}
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="px-6 py-3 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C5A265]" />
            <span>{t('nav.bookNow')}</span>
          </button>
        </div>

      </div>

      {/* Interactive Lightbox Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
          onClick={() => setSelectedItemIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-2xl overflow-hidden shadow-2xl border border-[#DECDB8] flex flex-col md:flex-row max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemIndex(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 w-9 h-9 rounded-full bg-[#1F1C18]/80 hover:bg-[#1F1C18] text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Image Area with Blur Placeholder */}
            <div className="md:w-3/5 bg-black relative flex items-center justify-center min-h-[280px] md:min-h-[460px] overflow-hidden">
              <LazyBlurImage
                src={activeModalItem.imageUrl}
                alt={language === 'ar' ? activeModalItem.titleAr : activeModalItem.titleEn}
                containerClassName="w-full h-full"
                priority={true}
                className="w-full h-full object-cover max-h-[55vh] md:max-h-[92vh]"
              />

              {/* Prev / Next controls */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right/Info Area */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-start space-y-6">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#DECDB8] text-[11px] font-medium text-[#736652]">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A265]" />
                  <span>
                    {language === 'ar' ? activeModalItem.branchAr : activeModalItem.branchEn}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1F1C18]">
                  {language === 'ar' ? activeModalItem.titleAr : activeModalItem.titleEn}
                </h3>

                <p className="text-xs sm:text-sm text-[#5D5548] leading-relaxed">
                  {language === 'ar' ? activeModalItem.descriptionAr : activeModalItem.descriptionEn}
                </p>

                {/* Key Features List */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs uppercase font-semibold text-[#8A714C] tracking-wider block">
                    {isRTL ? 'المواصفات والتجهيزات:' : 'Suite Specifications:'}
                  </span>
                  <ul className="space-y-2">
                    {(language === 'ar' ? activeModalItem.featuresAr : activeModalItem.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#4A4337]">
                        <ShieldCheck className="w-4 h-4 text-[#A88756] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Booking Action */}
              <div className="pt-4 border-t border-[#E8DEC8]">
                <button
                  onClick={() => {
                    setSelectedItemIndex(null);
                    onOpenBooking();
                  }}
                  className="w-full py-3 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#C5A265]" />
                  <span>{t('gallery.bookAtFacility')}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
