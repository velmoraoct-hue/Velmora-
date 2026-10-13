import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessSettings } from '../../types';
import { saveBusinessSettings } from '../../services/dataService';
import { Settings, Save, MapPin, Phone, Clock, Share2, Shield, CheckCircle } from 'lucide-react';

interface AdminBusinessSettingsProps {
  settings: BusinessSettings;
  onRefresh: () => void;
}

export const AdminBusinessSettings: React.FC<AdminBusinessSettingsProps> = ({
  settings,
  onRefresh
}) => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof BusinessSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';

    try {
      await saveBusinessSettings(formData, actorEmail);
      setSavedSuccess(true);
      onRefresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving settings:', e);
      setErrorMessage(isRTL ? 'تعذر حفظ الإعدادات.' : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'إعدادات المركز والفروع والسياسات' : 'Clinic Branches & Business Settings'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'تعديل أرقام الهواتف الرسمية، الواتساب، عناوين الفروع، ساعات العمل وسياسات الإلغاء'
              : 'Configure official contact numbers, WhatsApp, branch addresses, working hours, and policies'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Contact Numbers Box */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-semibold text-[#1F1C18] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#8A714C]" />
            <span>{isRTL ? 'أرقام التواصل الرسمية' : 'Official Phone & WhatsApp'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'هاتف فرع 6 أكتوبر' : 'October Branch Phone'}
              </label>
              <input
                type="text"
                value={formData.phoneOctober}
                onChange={(e) => handleChange('phoneOctober', e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'هاتف فرع الشيخ زايد' : 'Sheikh Zayed Branch Phone'}
              </label>
              <input
                type="text"
                value={formData.phoneZayed}
                onChange={(e) => handleChange('phoneZayed', e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'رقم الواتساب الرسمي (خدمة العملاء)' : 'Official WhatsApp'}
              </label>
              <input
                type="text"
                value={formData.whatsApp}
                onChange={(e) => handleChange('whatsApp', e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Branch Addresses Box */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-semibold text-[#1F1C18] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8A714C]" />
            <span>{isRTL ? 'عناوين الفروع وروابط خرائط Google' : 'Branch Addresses & Google Maps URLs'}</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان فرع 6 أكتوبر (عربي)' : 'October Address (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.octoberAddressAr}
                  onChange={(e) => handleChange('octoberAddressAr', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان فرع 6 أكتوبر (English)' : 'October Address (English)'}
                </label>
                <input
                  type="text"
                  value={formData.octoberAddressEn}
                  onChange={(e) => handleChange('octoberAddressEn', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'رابط خريطة Google لفرع 6 أكتوبر' : 'October Google Maps Link'}
              </label>
              <input
                type="url"
                value={formData.googleMapsOctoberUrl}
                onChange={(e) => handleChange('googleMapsOctoberUrl', e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان فرع الشيخ زايد (عربي)' : 'Sheikh Zayed Address (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.zayedAddressAr}
                  onChange={(e) => handleChange('zayedAddressAr', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان فرع الشيخ زايد (English)' : 'Sheikh Zayed Address (English)'}
                </label>
                <input
                  type="text"
                  value={formData.zayedAddressEn}
                  onChange={(e) => handleChange('zayedAddressEn', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'رابط خريطة Google لفرع الشيخ زايد' : 'Sheikh Zayed Google Maps Link'}
              </label>
              <input
                type="url"
                value={formData.googleMapsZayedUrl}
                onChange={(e) => handleChange('googleMapsZayedUrl', e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Policies Box */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-semibold text-[#1F1C18] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8A714C]" />
            <span>{isRTL ? 'ساعات العمل وسياسات المركز' : 'Working Hours & Policies'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'ساعات العمل الرسمية (عربي)' : 'Working Hours (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.openingHoursAr}
                onChange={(e) => handleChange('openingHoursAr', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'ساعات العمل الرسمية (English)' : 'Working Hours (English)'}
              </label>
              <input
                type="text"
                value={formData.openingHoursEn}
                onChange={(e) => handleChange('openingHoursEn', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'سياسة الإلغاء وتعديل المواعيد (عربي)' : 'Cancellation Policy (Arabic)'}
              </label>
              <textarea
                rows={2}
                value={formData.cancellationPolicyAr}
                onChange={(e) => handleChange('cancellationPolicyAr', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'سياسة الإلغاء وتعديل المواعيد (English)' : 'Cancellation Policy (English)'}
              </label>
              <textarea
                rows={2}
                value={formData.cancellationPolicyEn}
                onChange={(e) => handleChange('cancellationPolicyEn', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C5A265]" />
            <span>{isSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ إعدادات المركز' : 'Save Business Settings')}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
