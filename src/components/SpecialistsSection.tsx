import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Practitioner } from '../types';
import { Award, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';

interface SpecialistsSectionProps {
  practitioners: Practitioner[];
  onBookWithPractitioner: (practitionerId: string) => void;
}

export const SpecialistsSection: React.FC<SpecialistsSectionProps> = ({
  practitioners,
  onBookWithPractitioner
}) => {
  const { language, isRTL, t } = useLanguage();

  const activePractitioners = practitioners.filter((p) => p.isActive);

  return (
    <section id="specialists" className="py-16 sm:py-24 bg-[#F3ECE2]/50 border-t border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A714C] font-semibold">
            CLINICAL MEDICAL TEAM
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1C18] font-normal">
            {t('specialists.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#686053]">
            {t('specialists.subtitle')}
          </p>
        </div>

        {/* Verification banner */}
        <div className="mb-10 p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D4C3] flex items-center gap-3 max-w-3xl mx-auto text-start">
          <ShieldCheck className="w-5 h-5 text-[#A88756] shrink-0" />
          <p className="text-xs sm:text-sm text-[#5D5547] leading-relaxed">
            {t('specialists.disclaimer')}
          </p>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {activePractitioners.map((doc) => {
            const displayName = language === 'ar' ? doc.nameAr : doc.nameEn;
            const displayTitle = language === 'ar' ? doc.titleAr : doc.titleEn;
            const displayQual = language === 'ar' ? doc.qualificationsAr : doc.qualificationsEn;

            return (
              <div
                key={doc.id}
                className="bg-[#FAF7F2] rounded-xl border border-[#E5DAC8] overflow-hidden shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between text-start space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Photo */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#E2D5C3] shrink-0 border-2 border-white shadow-xs">
                    {doc.photoUrl ? (
                      <img
                        src={doc.photoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A88756]">
                        <Award className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-serif font-medium text-[#1F1C18]">
                        {displayName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {isRTL ? 'معتمد' : 'Verified'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#8A714C] font-medium">
                      {displayTitle}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-[#736B5E] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#A88756]" />
                      <span>
                        {doc.branch === 'both'
                          ? (isRTL ? 'فرعا 6 أكتوبر والشيخ زايد' : 'October & Zayed Branches')
                          : doc.branch === 'october'
                          ? (isRTL ? 'فرع 6 أكتوبر' : '6th of October Branch')
                          : (isRTL ? 'فرع الشيخ زايد' : 'Sheikh Zayed Branch')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualifications & Approved Procedures */}
                <div className="space-y-3 pt-4 border-t border-[#EAE0D3] text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="font-semibold text-[#4A4337] block text-xs">
                      {isRTL ? 'المؤهلات والتراخيص الرسمية:' : 'Verified Credentials & Licensing:'}
                    </span>
                    <p className="text-[#645B4E] leading-relaxed text-xs">
                      {displayQual}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="font-semibold text-[#4A4337] block text-xs">
                      {isRTL ? 'الإجراءات والبروتوكولات المعتمدة:' : 'Approved Clinical Procedures:'}
                    </span>
                    <p className="text-[#645B4E] text-xs bg-[#F3ECE2] p-2.5 rounded border border-[#E5DAC8]">
                      {doc.approvedProcedures}
                    </p>
                  </div>
                </div>

                {/* Booking Trigger */}
                <button
                  onClick={() => onBookWithPractitioner(doc.id)}
                  className="w-full py-2.5 text-xs sm:text-sm font-medium bg-[#1F1C18] hover:bg-[#342E26] text-[#FAF7F2] rounded-md transition-colors cursor-pointer text-center"
                >
                  {isRTL ? 'طلب موعد مع المتخصص' : 'Request Appointment with Specialist'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
