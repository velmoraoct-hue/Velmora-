import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Practitioner } from '../../types';
import { savePractitioner } from '../../services/dataService';
import { Stethoscope, Plus, Edit2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface AdminPractitionersProps {
  practitioners: Practitioner[];
  onRefresh: () => void;
}

export const AdminPractitioners: React.FC<AdminPractitionersProps> = ({
  practitioners,
  onRefresh
}) => {
  const { isRTL } = useLanguage();
  const { staffUser, isOwnerOrAdmin } = useAuth();

  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [qualificationsAr, setQualificationsAr] = useState('');
  const [qualificationsEn, setQualificationsEn] = useState('');
  const [approvedProcedures, setApprovedProcedures] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [branch, setBranch] = useState<'october' | 'zayed' | 'both'>('both');

  const openCreate = () => {
    setEditingPractitioner(null);
    setNameAr('');
    setNameEn('');
    setTitleAr('');
    setTitleEn('');
    setQualificationsAr('');
    setQualificationsEn('');
    setApprovedProcedures('');
    setPhotoUrl('');
    setIsActive(true);
    setBranch('both');
    setActiveModal('create');
  };

  const openEdit = (p: Practitioner) => {
    setEditingPractitioner(p);
    setNameAr(p.nameAr);
    setNameEn(p.nameEn);
    setTitleAr(p.titleAr);
    setTitleEn(p.titleEn);
    setQualificationsAr(p.qualificationsAr);
    setQualificationsEn(p.qualificationsEn);
    setApprovedProcedures(p.approvedProcedures);
    setPhotoUrl(p.photoUrl || '');
    setIsActive(p.isActive);
    setBranch(p.branch);
    setActiveModal('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    const id = editingPractitioner ? editingPractitioner.id : 'doc-' + Date.now().toString(36);

    const payload: Practitioner = {
      id,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      qualificationsAr: qualificationsAr.trim(),
      qualificationsEn: qualificationsEn.trim(),
      approvedProcedures: approvedProcedures.trim(),
      photoUrl: photoUrl.trim() || undefined,
      isActive,
      branch
    };

    try {
      await savePractitioner(payload, actorEmail);
      setActiveModal(null);
      onRefresh();
    } catch (e) {
      console.error('Error saving practitioner:', e);
      setErrorMessage(isRTL ? 'تعذر حفظ بيانات المتخصص.' : 'Failed to save practitioner.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'الكادر الطبي والمتخصصون' : 'Medical Staff & Practitioners'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'إدارة الملفات المهنية، التراخيص الإكلينيكية، والإجراءات المصرح بها رسمياً'
              : 'Manage verified clinical profiles, medical licenses, and approved procedures'}
          </p>
          {errorMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A265]" />
            <span>{isRTL ? 'إضافة طبيب / متخصص' : 'Add Practitioner'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practitioners.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-xl bg-[#FAF7F2] border border-[#DECDB8] shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#E2D5C3] shrink-0 border border-white">
                {doc.photoUrl ? (
                  <img src={doc.photoUrl} alt={doc.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8A714C]">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
                    {doc.nameAr} ({doc.nameEn})
                  </h3>
                  {doc.isActive ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      {isRTL ? 'نشط' : 'Active'}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8A714C] font-medium">{doc.titleAr}</p>
                <p className="text-[11px] text-[#786F62]">{doc.qualificationsAr}</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-[#E4D9C8] text-xs space-y-1">
              <span className="font-semibold text-[#4A4337] block text-[11px]">
                {isRTL ? 'الإجراءات المصرح له بها:' : 'Approved Procedures:'}
              </span>
              <p className="text-[#645B4E] text-[11px]">{doc.approvedProcedures}</p>
            </div>

            {isOwnerOrAdmin && (
              <div className="flex justify-end pt-2 border-t border-[#E8DEC8]">
                <button
                  onClick={() => openEdit(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4A4337] hover:bg-[#F3ECE2] rounded font-medium cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'تعديل البيانات' : 'Edit Profile'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-[#FAF7F2] rounded-xl max-w-lg w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {activeModal === 'create'
                  ? (isRTL ? 'إضافة متخصص جديد' : 'Add Practitioner')
                  : (isRTL ? 'تعديل بيانات المتخصص' : 'Edit Practitioner')}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-[#786F62] hover:text-[#1F1C18]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الاسم بالإنجليزية *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'المسمى الوظيفي (عربي)' : 'Title (Arabic)'}
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
                    {isRTL ? 'المسمى الوظيفي (English)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'المؤهلات والتراخيص الرسمية (عربي)' : 'Credentials & Licensing (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={qualificationsAr}
                  onChange={(e) => setQualificationsAr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الإجراءات المصرح بها' : 'Approved Clinical Procedures'}
                </label>
                <input
                  type="text"
                  value={approvedProcedures}
                  onChange={(e) => setApprovedProcedures(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الفرع' : 'Branch'}
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  >
                    <option value="both">{isRTL ? 'كلا الفرعين (أكتوبر وزايد)' : 'Both Branches'}</option>
                    <option value="october">{isRTL ? 'فرع 6 أكتوبر' : 'October Branch'}</option>
                    <option value="zayed">{isRTL ? 'فرع الشيخ زايد' : 'Zayed Branch'}</option>
                  </select>
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
                    <option value="active">{isRTL ? 'نشط ومتاح للحجز' : 'Active & Available'}</option>
                    <option value="inactive">{isRTL ? 'غير نشط (إجازة/معلق)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'رابط الصورة الشخصية (URL)' : 'Photo URL'}
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-medium text-[#5C5447] hover:bg-[#EAE0D3] rounded cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-white rounded text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
