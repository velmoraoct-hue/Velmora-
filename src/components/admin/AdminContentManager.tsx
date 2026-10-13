import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { logAuditAction } from '../../services/dataService';
import { FileText, Save, CheckCircle } from 'lucide-react';

export const AdminContentManager: React.FC = () => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [announcementAr, setAnnouncementAr] = useState(
    'فرعا مدينة 6 أكتوبر والشيخ زايد يرحبان بكم للحجز والاستشارة'
  );
  const [announcementEn, setAnnouncementEn] = useState(
    '6th of October City & Sheikh Zayed branches are open for appointments'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    await logAuditAction('UPDATE_WEBSITE_CONTENT', actorEmail, 'Updated top announcement banners');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'إدارة محتوى وإعلانات الموقع' : 'Website Content & Announcements'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'تحديث شريط الإعلانات العلوي، التنبيهات الإكلينيكية، والملاحظات الإرشادية'
              : 'Manage micro-announcements, clinical disclaimers, and seasonal notice bars'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? 'تم تحديث المحتوى!' : 'Content updated!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-4 shadow-xs">
        <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
          {isRTL ? 'شريط الإعلان العلوي (Top Micro Bar)' : 'Top Header Announcement Banner'}
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#4A4337]">
              {isRTL ? 'نص الإعلان (بالعربية)' : 'Announcement Text (Arabic)'}
            </label>
            <input
              type="text"
              value={announcementAr}
              onChange={(e) => setAnnouncementAr(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#4A4337]">
              {isRTL ? 'نص الإعلان (بالإنجليزية)' : 'Announcement Text (English)'}
            </label>
            <input
              type="text"
              value={announcementEn}
              onChange={(e) => setAnnouncementEn(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E8DEC8]">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#C5A265]" />
            <span>{isRTL ? 'حفظ التعديلات' : 'Save Content'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
