import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Offer } from '../../types';
import { saveOffer } from '../../services/dataService';
import { Tag, Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

interface AdminOffersProps {
  offers: Offer[];
  onRefresh: () => void;
}

export const AdminOffers: React.FC<AdminOffersProps> = ({ offers, onRefresh }) => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [activeModal, setActiveModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [discountPriceEgp, setDiscountPriceEgp] = useState<number>(1000);
  const [originalPriceEgp, setOriginalPriceEgp] = useState<number>(1500);
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [servicesIncluded, setServicesIncluded] = useState('');

  const openCreate = () => {
    setEditingOffer(null);
    setTitleAr('');
    setTitleEn('');
    setDescriptionAr('');
    setDescriptionEn('');
    setDiscountPriceEgp(1000);
    setOriginalPriceEgp(1400);
    setValidUntil('2026-12-31');
    setIsActive(true);
    setServicesIncluded('');
    setActiveModal(true);
  };

  const openEdit = (o: Offer) => {
    setEditingOffer(o);
    setTitleAr(o.titleAr);
    setTitleEn(o.titleEn);
    setDescriptionAr(o.descriptionAr);
    setDescriptionEn(o.descriptionEn);
    setDiscountPriceEgp(o.discountPriceEgp);
    setOriginalPriceEgp(o.originalPriceEgp);
    setValidUntil(o.validUntil);
    setIsActive(o.isActive);
    setServicesIncluded(o.servicesIncluded);
    setActiveModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !titleEn.trim()) return;

    setIsSaving(true);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    const id = editingOffer ? editingOffer.id : 'off-' + Date.now().toString(36);

    const payload: Offer = {
      id,
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      discountPriceEgp: Number(discountPriceEgp),
      originalPriceEgp: Number(originalPriceEgp),
      validUntil,
      isActive,
      servicesIncluded: servicesIncluded.trim()
    };

    try {
      await saveOffer(payload, actorEmail);
      setActiveModal(false);
      onRefresh();
    } catch (e) {
      console.error('Error saving offer:', e);
      setErrorMessage(isRTL ? 'تعذر حفظ العرض.' : 'Failed to save offer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'إدارة العروض والباقات الترويجية' : 'Curated Packages & Offers'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'إنشاء باقات مجمعة بأسعار مخفضة وتحديد فترات الصلاحية'
              : 'Create signature treatment bundles, discounted prices, and validity limits'}
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'إضافة باقة جديدة' : 'Add Package'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="p-6 rounded-xl bg-[#FAF7F2] border border-[#DECDB8] shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-[#8A714C]">{offer.id}</span>
                {offer.isActive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {isRTL ? 'مفعل بالموقع' : 'Active'}
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                    {isRTL ? 'معطل' : 'Disabled'}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-lg font-semibold text-[#1F1C18]">
                {offer.titleAr} ({offer.titleEn})
              </h3>

              <p className="text-xs text-[#5D5548] leading-relaxed">
                {offer.descriptionAr}
              </p>

              <div className="p-3 bg-white rounded-lg border border-[#E4D9C8] text-xs">
                <span className="font-semibold text-[#4A4337] block text-[11px] mb-0.5">
                  {isRTL ? 'الجلسات المشمولة:' : 'Included Services:'}
                </span>
                <p className="text-[#645B4E]">{offer.servicesIncluded}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8A714C] line-through block">
                  {offer.originalPriceEgp} EGP
                </span>
                <span className="text-xl font-serif font-bold text-[#1F1C18]">
                  {offer.discountPriceEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                </span>
              </div>

              <button
                onClick={() => openEdit(offer)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#4A4337] hover:bg-[#F3ECE2] rounded font-medium cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isRTL ? 'تعديل' : 'Edit'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-[#FAF7F2] rounded-xl max-w-md w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {editingOffer ? (isRTL ? 'تعديل الباقة' : 'Edit Package') : (isRTL ? 'إضافة باقة جديدة' : 'Add Package')}
              </h3>
              <button onClick={() => setActiveModal(false)} className="text-[#786F62] hover:text-[#1F1C18]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان الباقة بالعربية *' : 'Title (Arabic) *'}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'عنوان الباقة بالإنجليزية *' : 'Title (English) *'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'السعر المخفض (ج.م) *' : 'Discount Price (EGP) *'}
                  </label>
                  <input
                    type="number"
                    value={discountPriceEgp}
                    onChange={(e) => setDiscountPriceEgp(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'السعر الأصلي (ج.م)' : 'Original Price (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={originalPriceEgp}
                    onChange={(e) => setOriginalPriceEgp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الجلسات والخدمات المشمولة' : 'Included Services'}
                </label>
                <input
                  type="text"
                  value={servicesIncluded}
                  onChange={(e) => setServicesIncluded(e.target.value)}
                  placeholder="e.g. VIP Facial + Mesotherapy"
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'تاريخ الانتهاء' : 'Valid Until'}
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  >
                    <option value="active">{isRTL ? 'مفعل (يظهر للجمهور)' : 'Active'}</option>
                    <option value="inactive">{isRTL ? 'معطل' : 'Disabled'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الوصف بالعربية' : 'Description (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setActiveModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C5447] hover:bg-[#EAE0D3] rounded cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-white rounded text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الباقة' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
