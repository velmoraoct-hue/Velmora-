import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand
    'brand.name': 'ڤيلمورا للتجميل والعناية بالبشرة',
    'brand.name.en': 'VELMORA AESTHETICS & BEAUTY',
    'brand.tagline': 'وجهتكِ الراقية لجمال طبيعي متألق في 6 أكتوبر والشيخ زايد',
    'brand.subtitle': 'عيادة متخصصة تجمع بين أحدث التقنيات الطبية ومعايير العناية العالمية المعتمدة في جمهورية مصر العربية',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.services': 'قائمة الخدمات',
    'nav.about': 'عن ڤيلمورا',
    'nav.specialists': 'الأطباء والمتخصصون',
    'nav.gallery': 'مرافق العيادة',
    'nav.offers': 'الباقات والعروض',
    'nav.booking': 'احجزي موعدك',
    'nav.contact': 'الفروع والتواصل',
    'nav.adminPortal': 'بوابة الإدارة',
    'nav.bookNow': 'احجزي موعدكِ',

    // Gallery
    'gallery.badge': 'جولة في أروقة المركز • 6 أكتوبر & الشيخ زايد',
    'gallery.title': 'المرافق والتجهيزات الفاخرة',
    'gallery.subtitle': 'صُممت عياداتنا لتوفر لكِ أقصى درجات الخصوصية، والراحة النفسية، مع الالتزام التام بأعلى معايير التعقيم السريري المعتمدة.',
    'gallery.filter.all': 'جميع المرافق',
    'gallery.filter.suites': 'أجنحة الجلسات والاستشارة',
    'gallery.filter.lounge': 'الاستقبال وضيافة VIP',
    'gallery.filter.clinical': 'غرف التعقيم والإجراءات',
    'gallery.viewDetails': 'تكبير ومعاينة المرفق',
    'gallery.bookAtFacility': 'احجزي جلستكِ في هذا الجناح',

    // Hero
    'hero.badge': 'عيادة تجميل وطب جلدي معتمدة • 6 أكتوبر & الشيخ زايد',
    'hero.title': 'جمالكِ الطبيعي بأيدٍ طبية موثوقة',
    'hero.desc': 'نقدم تجربة تجميلية استثنائية مصممة خصيصاً لبشرتكِ، باستخدام أحدث المستحضرات السويسرية والفرنسية وتحت إشراف طبي مرخص وبأعلى معايير التعقيم السريري.',
    'hero.ctaBooking': 'احجزي موعدك',
    'hero.ctaServices': 'اكتشفي خدماتنا',
    'hero.statYears': 'معايير سريرية معتمدة',
    'hero.statClients': 'بروتوكولات علاجية مخصصة',
    'hero.statBranches': 'فرعان في زايد وأكتوبر',

    // Trust Pillars
    'trust.title': 'لماذا تختارين عيادة ڤيلمورا؟',
    'trust.subtitle': 'التزامنا الصارم بالمعايير الطبية والشفافية التامة',
    'trust.pillar1.title': 'إشراف طبي مرخص',
    'trust.pillar1.desc': 'تُجرى جميع الإجراءات الطبية والتجميلية بواسطة أطباء جلدية وتجميل معتمدين من وزارة الصحة ونقابة الأطباء المصرية.',
    'trust.pillar2.title': 'أعلى معايير التعقيم والوقاية',
    'trust.pillar2.desc': 'أدوات معقمة ذات استخدام فردي ومحاليل طبية أصلية 100% معتمدة دولياً ومسجلة رسمياً.',
    'trust.pillar3.title': 'شفافية الأسعار بدون مفاجآت',
    'trust.pillar3.desc': 'أسعار واضحة بالجنيه المصري لكل جلسة، مع تقييم دقيق لاحتياجاتكِ الفعلية دون مبالغة أو تسويق غير مبرر.',
    'trust.pillar4.title': 'لا وعود وهمية أو نتائج خيالية',
    'trust.pillar4.desc': 'نؤمن بالتحسين الطبيعي المستدام وصحة البشرة الحقيقية، مع شرح وافٍ للنتائج المتوقعة ومراحل التعافي.',

    // Services Page
    'services.title': 'دليل الخدمات والأسعار الاسترشادية',
    'services.subtitle': 'خدمات عناية بالبشرة وإجراءات تجميلية طبية بأعلى معايير الاحترافية (الأسعار بالجنيه المصري EGP)',
    'services.cat.all': 'جميع الخدمات',
    'services.cat.skincare': 'العناية بالبشرة',
    'services.cat.injectables': 'الحقن التجميلي',
    'services.cat.peeling': 'التقشير العلاجي',
    'services.cat.laser': 'الليزر والتجديد',
    'services.duration': 'المدة',
    'services.minutes': 'دقيقة',
    'services.startingFrom': 'بدءاً من',
    'services.consultationRequired': 'يتطلب فحصاً وتقييماً طبياً سريرياً مسبقاً',
    'services.bookThis': 'طلب حجز هذه الخدمة',
    'services.priceNotice': 'ملاحظة: الأسعار المعروضة هي قيم تمهيدية استرشادية وتخضع لتأكيد الطبيب المعالج بعد الفحص السريري.',

    // About
    'about.title': 'عن عيادة ڤيلمورا (VELMORA)',
    'about.story.title': 'رؤيتنا في الجمال السريري الراقي',
    'about.story.p1': 'انطلقت ڤيلمورا لتلبي تطلعات عملاء مدينتي 6 أكتوبر والشيخ زايد الباحثين عن التميز السريري والرقي المعاصر في آنٍ واحد. نحن نرفض المفهوم التجاري السطحي لمراكز التجميل، ونستبدله بنموذج طبي متكامل يُعلي من شأن صحة البشرة أولاً.',
    'about.story.p2': 'كل خطوة داخل عيادتنا مدروسة بعناية: من لحظة الاستقبال الهادئ، إلى الفحص الدقيق، وحتى اختيار المستحضرات الأوروبية الأكثر نقاءً وملاءمةً للمناخ المصري وطبيعة البشرة الشرقية.',
    'about.ethics.title': 'ميثاق الأمانة والترخيص المهني',
    'about.ethics.desc': 'نلتزم التزاماً كاملاً بالقوانين واللوائح المنظمة للمنشآت الطبية والعيادات في جمهورية مصر العربية. لا نقوم بأي إجراء تداخلي إلا بعد التأكد التام من مؤهلات الممارس وجهوزية العيادة وترخيصها النظامي.',

    // Specialists
    'specialists.title': 'الكادر الطبي وأخصائيو البشرة',
    'specialists.subtitle': 'فريق متخصص يجمع بين الخبرة الأكاديمية والمهارة الإكلينيكية المعتمدة',
    'specialists.disclaimer': 'تنبيه مهني: لا ننشر إلا الملفات المهنية الحقيقية والمتحقق من تراخيصها الرسمية. الإجراءات الطبية المعتمدة محددة بدقة وفق تخصص كل ممارس.',

    // Booking
    'booking.title': 'حجز موعد واستشارة',
    'booking.subtitle': 'اختاري الخدمة والتوقيت المفضلين وسيقوم فريق الاستقبال بالتواصل معكِ لتأكيد الحجز النهائي',
    'booking.step1': '1. اختيار الخدمة',
    'booking.step2': '2. الفرع والطبيب',
    'booking.step3': '3. الموعد والتوقيت',
    'booking.step4': '4. بيانات الاتصال',
    'booking.branch': 'اختيار الفرع',
    'booking.branch.october': 'فرع 6 أكتوبر (المحور المركزي)',
    'booking.branch.zayed': 'فرع الشيخ زايد (وصلة دهشور)',
    'booking.selectPractitioner': 'اختيار الممارس (اختياري)',
    'booking.anyPractitioner': 'أقرب متخصص متاح',
    'booking.date': 'تاريخ الجلسة',
    'booking.time': 'الوقت المفضل',
    'booking.name': 'الاسم بالكامل',
    'booking.phone': 'رقم الهاتف (مصر +20)',
    'booking.phonePlaceholder': 'مثال: 01012345678',
    'booking.notes': 'ملاحظات إضافية أو استفسارات',
    'booking.notesPlaceholder': 'هل تعانين من تحسس معين أو تفضلين وقتاً محدداً؟',
    'booking.submit': 'إرسال طلب الحجز',
    'booking.submitting': 'جارٍ تسجيل الحجز...',
    'booking.successTitle': 'تم استلام طلب حجزكِ بنجاح!',
    'booking.successRef': 'رقم الحجز المرجعي',
    'booking.successMsg': 'طلبكِ مسجل بحالة (قيد التأكيد). سيتواصل معكِ فريق استقبال ڤيلمورا عبر مكالمة هاتفية أو رسالة واتساب خلال أوقات العمل لتأكيد الموعد النهائي وإعطائكِ التوجيهات التحضيرية للجلسة.',
    'booking.newBooking': 'حجز موعد جديد',
    'booking.bookedSlotWarning': 'هذا التوقيت محجوز مسبقاً، يرجى اختيار موعد آخر تجنباً للتضارب.',

    // Contact
    'contact.title': 'التواصل ومواقع الفروع',
    'contact.subtitle': 'نسعد باستقبالكِ واستفساراتكِ طوال أيام الأسبوع',
    'contact.whatsapp': 'محادثة واتساب مباشرة',
    'contact.call': 'اتصال هاتفي',
    'contact.october': 'فرع 6 أكتوبر',
    'contact.zayed': 'فرع الشيخ زايد',
    'contact.hours': 'ساعات العمل الرسمية',

    // Disclaimer & Footer
    'footer.disclaimerTitle': 'إخلاء مسؤولية طبي وقانوني',
    'footer.disclaimerText': 'جميع المعلومات والمحتويات والأسعار المعروضة على هذا الموقع هي لأغراض تثقيفية واسترشادية عامة ولا تعد بديلاً عن الاستشارة الطبية المتخصصة أو التشخيص السريري المباشر. استجابة البشرة للإجراءات تختلف من شخص لآخر. الإجراءات التداخلية تخضع للمعاينة والفحص من قبل الطبيب المعالج.',
    'footer.rights': 'جميع الحقوق محفوظة © VELMORA Aesthetics & Beauty',
    'footer.privacy': 'سياسة الخصوصية وسرية البيانات',
    'footer.cancellation': 'سياسة الإلغاء والتعديل',

    // Admin
    'admin.loginTitle': 'بوابة إدارة عيادة ڤيلمورا',
    'admin.loginDesc': 'منظومة الإدارة الإكلينيكية والتشغيلية الموحدة للموظفين المصرح لهم فقط',
    'admin.googleLogin': 'تسجيل الدخول عبر Google',
    'admin.demoLogin': 'تسجيل دخول تجريبي للإدارة (وضع العرض)',
    'admin.logout': 'تسجيل الخروج',
    'admin.unauthorized': 'غير مصرح لك بالوصول إلى هذه البيانات',
    'admin.dashboard': 'لوحة المؤشرات',
    'admin.bookings': 'إدارة الحجوزات',
    'admin.customers': 'سجل العملاء',
    'admin.services': 'دليل الخدمات',
    'admin.practitioners': 'الكادر الطبي',
    'admin.staff': 'الموظفون والصلاحيات',
    'admin.offers': 'العروض والباقات',
    'admin.expenses': 'سجل المصروفات',
    'admin.inventory': 'المخزون والمستلزمات',
    'admin.finance': 'التقارير المالية',
    'admin.content': 'محتوى الموقع',
    'admin.settings': 'إعدادات المركز',
    'admin.currency': 'ج.م',
  },
  en: {
    // Brand
    'brand.name': 'VELMORA Aesthetics & Beauty',
    'brand.name.en': 'VELMORA AESTHETICS & BEAUTY',
    'brand.tagline': 'Your refined destination for radiant natural beauty in 6th of October & Sheikh Zayed',
    'brand.subtitle': 'A specialized clinic uniting advanced medical aesthetics with international hygiene standards in Egypt',

    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About Us',
    'nav.specialists': 'Specialists',
    'nav.offers': 'Packages & Offers',
    'nav.booking': 'Book Appointment',
    'nav.gallery': 'Facilities & Gallery',
    'nav.contact': 'Branches & Contact',
    'nav.adminPortal': 'Staff Portal',
    'nav.bookNow': 'Book Appointment',

    // Gallery
    'gallery.badge': 'Clinic Tour • 6th of October & Sheikh Zayed',
    'gallery.title': 'Boutique Facilities & Clinical Suites',
    'gallery.subtitle': 'Designed to offer supreme personal privacy, tranquil luxury, and hospital-grade sterilization protocols.',
    'gallery.filter.all': 'All Facilities',
    'gallery.filter.suites': 'Treatment Suites',
    'gallery.filter.lounge': 'Reception & VIP Lounge',
    'gallery.filter.clinical': 'Sterilization & Clinical Lab',
    'gallery.viewDetails': 'View & Enlarge Suite',
    'gallery.bookAtFacility': 'Reserve a Treatment in this Suite',

    // Hero
    'hero.badge': 'Licensed Aesthetic & Dermatology Clinic • 6th of October & Sheikh Zayed',
    'hero.title': 'Natural Enhancement in Trusted Medical Hands',
    'hero.desc': 'Experience bespoke skincare and physician-led aesthetic treatments using premium Swiss and French formulations under certified clinical protocols.',
    'hero.ctaBooking': 'Book Your Appointment',
    'hero.ctaServices': 'Explore Our Services',
    'hero.statYears': 'Certified Clinical Standards',
    'hero.statClients': 'Tailored Treatment Plans',
    'hero.statBranches': 'October & Zayed Branches',

    // Trust Pillars
    'trust.title': 'Why Choose VELMORA?',
    'trust.subtitle': 'Our uncompromising commitment to clinical safety and absolute transparency',
    'trust.pillar1.title': 'Licensed Medical Practitioners',
    'trust.pillar1.desc': 'All clinical and injectable procedures are administered strictly by physicians licensed by the Egyptian Ministry of Health and Medical Syndicate.',
    'trust.pillar2.title': 'Hospital-Grade Sterilization',
    'trust.pillar2.desc': 'Strict single-use sterile instruments and 100% authentic, internationally certified pharmaceuticals.',
    'trust.pillar3.title': 'Transparent EGP Pricing',
    'trust.pillar3.desc': 'Clear preliminary pricing with thorough diagnostic evaluation—never unnecessary upsells.',
    'trust.pillar4.title': 'No False Guarantees',
    'trust.pillar4.desc': 'We believe in sustainable skin health and natural beauty, setting honest clinical expectations.',

    // Services Page
    'services.title': 'Treatment Catalog & Indicative Pricing',
    'services.subtitle': 'Skincare protocols and aesthetic treatments executed to the highest medical standards (Prices in EGP)',
    'services.cat.all': 'All Treatments',
    'services.cat.skincare': 'Skincare',
    'services.cat.injectables': 'Aesthetic Injectables',
    'services.cat.peeling': 'Clinical Peeling',
    'services.cat.laser': 'Laser & Rejuvenation',
    'services.duration': 'Duration',
    'services.minutes': 'mins',
    'services.startingFrom': 'Starting at',
    'services.consultationRequired': 'Prior in-person clinical evaluation required',
    'services.bookThis': 'Request This Treatment',
    'services.priceNotice': 'Note: Listed prices are preliminary business values subject to final clinical confirmation during consultation.',

    // About
    'about.title': 'About VELMORA Clinic',
    'about.story.title': 'Our Philosophy of Refined Clinical Aesthetics',
    'about.story.p1': 'VELMORA was established to fulfill the expectations of clients in 6th of October City and Sheikh Zayed who seek international medical excellence in an atmosphere of modern elegance. We replace aggressive commercial salon practices with ethical, dermatologist-guided skincare.',
    'about.story.p2': 'Every step within our clinic is curated: from your peaceful arrival to rigorous dermal analysis and European certified active ingredients tailored for Mediterranean skin types.',
    'about.ethics.title': 'Code of Ethics & Regulatory Compliance',
    'about.ethics.desc': 'We strictly adhere to all Egyptian healthcare facility and physician licensing regulations. No invasive procedure is offered without verified practitioner credentials and full facility compliance.',

    // Specialists
    'specialists.title': 'Physicians & Skincare Specialists',
    'specialists.subtitle': 'A verified team combining academic rigor with certified clinical expertise',
    'specialists.disclaimer': 'Professional notice: We only list verified practitioner profiles with confirmed Ministry of Health licensing. Permitted procedures are strictly defined per specialist scope.',

    // Booking
    'booking.title': 'Appointment & Consultation Request',
    'booking.subtitle': 'Choose your treatment and preferred slot. Our front desk will contact you promptly to finalize confirmation.',
    'booking.step1': '1. Choose Service',
    'booking.step2': '2. Branch & Doctor',
    'booking.step3': '3. Date & Time',
    'booking.step4': '4. Contact Details',
    'booking.branch': 'Select Branch',
    'booking.branch.october': '6th of October Branch (Central Axis)',
    'booking.branch.zayed': 'Sheikh Zayed Branch (Dahshur Link)',
    'booking.selectPractitioner': 'Preferred Practitioner (Optional)',
    'booking.anyPractitioner': 'Earliest Available Specialist',
    'booking.date': 'Appointment Date',
    'booking.time': 'Preferred Time',
    'booking.name': 'Full Name',
    'booking.phone': 'Phone Number (Egypt +20)',
    'booking.phonePlaceholder': 'e.g. 01012345678',
    'booking.notes': 'Additional Notes or Skin Concerns',
    'booking.notesPlaceholder': 'Any allergies or specific preferences?',
    'booking.submit': 'Submit Booking Request',
    'booking.submitting': 'Submitting request...',
    'booking.successTitle': 'Booking Request Received Successfully!',
    'booking.successRef': 'Booking Reference ID',
    'booking.successMsg': 'Your request status is currently PENDING. Our front desk team will contact you via phone or WhatsApp during working hours to confirm the appointment and provide pre-treatment guidelines.',
    'booking.newBooking': 'Book Another Appointment',
    'booking.bookedSlotWarning': 'This time slot is already reserved. Please select a different time to avoid double booking.',

    // Contact
    'contact.title': 'Contact & Locations',
    'contact.subtitle': 'We welcome your visits and inquiries throughout the week',
    'contact.whatsapp': 'Direct WhatsApp Chat',
    'contact.call': 'Phone Call',
    'contact.october': '6th of October Branch',
    'contact.zayed': 'Sheikh Zayed Branch',
    'contact.hours': 'Clinic Working Hours',

    // Disclaimer & Footer
    'footer.disclaimerTitle': 'Medical & Legal Disclaimer',
    'footer.disclaimerText': 'All content, procedures, and indicative prices are provided for general educational purposes and do not substitute professional medical advice, clinical diagnosis, or treatment. Individual skin response may vary. Invasive treatments are subject to physician evaluation.',
    'footer.rights': 'All rights reserved © VELMORA Aesthetics & Beauty',
    'footer.privacy': 'Privacy & Data Protection Policy',
    'footer.cancellation': 'Cancellation & Rescheduling Policy',

    // Admin
    'admin.loginTitle': 'VELMORA Staff Management Portal',
    'admin.loginDesc': 'Unified clinical and operational dashboard for authorized personnel only',
    'admin.googleLogin': 'Sign in with Google',
    'admin.demoLogin': 'Quick Demo Admin Sign-in (Preview Mode)',
    'admin.logout': 'Sign Out',
    'admin.unauthorized': 'Unauthorized access to this resource',
    'admin.dashboard': 'Dashboard',
    'admin.bookings': 'Bookings',
    'admin.customers': 'Customers',
    'admin.services': 'Services Catalog',
    'admin.practitioners': 'Medical Staff',
    'admin.staff': 'Roles & Permissions',
    'admin.offers': 'Offers & Packages',
    'admin.expenses': 'Expense Log',
    'admin.inventory': 'Inventory',
    'admin.finance': 'Financial Reports',
    'admin.content': 'Website Content',
    'admin.settings': 'Business Settings',
    'admin.currency': 'EGP',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('velmora_lang') as Language;
    return saved === 'en' ? 'en' : 'ar'; // Default Arabic
  });

  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('velmora_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[language][key] || translations.ar[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
