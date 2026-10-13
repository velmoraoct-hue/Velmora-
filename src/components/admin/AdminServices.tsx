import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Service, ServiceCategory, ServiceStatus } from '../../types';
import { saveService, deleteService } from '../../services/dataService';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminServicesProps {
  services: Service[];
  onRefresh: () => void;
}

export const AdminServices: React.FC<AdminServicesProps> = ({ services, onRefresh }) => {
  const { language, isRTL } = useLanguage();
  const { staffUser, isOwnerOrAdmin } = useAuth();

  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('skincare');
  const [priceEgp, setPriceEgp] = useState<number>(400);
  const [priceMaxEgp, setPriceMaxEgp] = useState<number | undefined>(undefined);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [status, setStatus] = useState<ServiceStatus>('published');
  const [requiresMedicalConsultation, setRequiresMedicalConsultation] = useState<boolean>(false);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const openCreateModal = () => {
    setEditingService(null);
    setNameAr('');
    setNameEn('');
    setCategory('skincare');
    setPriceEgp(500);
    setPriceMaxEgp(undefined);
    setDurationMinutes(45);
    setStatus('published');
    setRequiresMedicalConsultation(false);
    setDescriptionAr('');
    setDescriptionEn('');
    setImageUrl('');
    setActiveModal('create');
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setNameAr(s.nameAr);
    setNameEn(s.nameEn);
    setCategory(s.category);
    setPriceEgp(s.priceEgp);
    setPriceMaxEgp(s.priceMaxEgp);
    setDurationMinutes(s.durationMinutes);
    setStatus(s.status);
    setRequiresMedicalConsultation(s.requiresMedicalConsultation);
    setDescriptionAr(s.descriptionAr);
    setDescriptionEn(s.descriptionEn);
    setImageUrl(s.imageUrl || '');
    setActiveModal('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) return;

    setIsSaving(true);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    const id = editingService ? editingService.id : 'svc-' + Date.now().toString(36);

    const payload: Service = {
      id,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      category,
      priceEgp: Number(priceEgp),
      priceMaxEgp: priceMaxEgp ? Number(priceMaxEgp) : undefined,
      durationMinutes: Number(durationMinutes),
      status,
      requiresMedicalConsultation,
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      imageUrl: imageUrl.trim() || undefined
    };

    try {
      await saveService(payload, actorEmail);
      setActiveModal(null);
      setErrorMessage(null);
      onRefresh();
    } catch (err) {
      console.error('Error saving service:', err);
      setErrorMessage(isRTL ? 'تعذر حفظ بيانات الخدمة.' : 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    try {
      await deleteService(deleteTargetId, actorEmail);
      setDeleteTargetId(null);
      setErrorMessage(null);
      onRefresh();
    } catch (e) {
      console.error('Error deleting service:', e);
      setErrorMessage(isRTL ? 'تعذر حذف الخدمة.' : 'Failed to delete service.');
    }
  };

  const getStatusBadge = (st: ServiceStatus) => {
    switch (st) {
      case 'published':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Eye className="w-3 h-3" /> {isRTL ? 'منشور للعامة' : 'Published'}</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><EyeOff className="w-3 h-3" /> {isRTL ? 'مسودة داخلية' : 'Draft'}</span>;
      case 'unavailable':
        return <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-semibold">{isRTL ? 'غير متاح مؤقتاً' : 'Unavailable'}</span>;
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'دليل الخدمات والأسعار وقواعد النشر' : 'Service Catalog & Publication Controls'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'تعديل الأسعار التمهيدية بالجنيه المصري EGP وتفعيل الإجراءات الطبية وفق التراخيص'
              : 'Manage preliminary EGP service pricing, publication status, and clinical requirements'}
          </p>
          {errorMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A265]" />
            <span>{isRTL ? 'إضافة خدمة جديدة' : 'Add New Service'}</span>
          </button>
        )}
      </div>

      {/* Services Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
              <tr>
                <th className="py-3 px-4">{isRTL ? 'الخدمة (عربي / English)' : 'Service Name'}</th>
                <th className="py-3 px-4">{isRTL ? 'القسم' : 'Category'}</th>
                <th className="py-3 px-4">{isRTL ? 'السعر (ج.م EGP)' : 'Price (EGP)'}</th>
                <th className="py-3 px-4">{isRTL ? 'المدة' : 'Duration'}</th>
                <th className="py-3 px-4">{isRTL ? 'الفحص الطبي' : 'Medical Eval'}</th>
                <th className="py-3 px-4">{isRTL ? 'حالة النشر' : 'Publication Status'}</th>
                {isOwnerOrAdmin && <th className="py-3 px-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE1D3] bg-white">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1F1C18] text-sm">{svc.nameAr}</div>
                    <div className="text-[11px] text-[#736B5E]">{svc.nameEn}</div>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-[#8A714C]">
                    {svc.category}
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-[#1F1C18]">
                    {svc.priceEgp.toLocaleString()}
                    {svc.priceMaxEgp && ` – ${svc.priceMaxEgp.toLocaleString()}`}
                    <span className="text-[10px] font-sans font-normal text-[#8A714C] mx-1">
                      {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5D5548]">
                    {svc.durationMinutes} {isRTL ? 'دقيقة' : 'mins'}
                  </td>
                  <td className="py-3.5 px-4">
                    {svc.requiresMedicalConsultation ? (
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-amber-700" />
                        {isRTL ? 'فحص طبي إلزامي' : 'Mandatory MD Eval'}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px]">{isRTL ? 'عناية مباشرة' : 'Standard'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(svc.status)}
                  </td>
                  {isOwnerOrAdmin && (
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 text-[#5D5548] hover:text-[#1F1C18] hover:bg-[#F3ECE2] rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(svc.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Service Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-[#FAF7F2] rounded-xl max-w-lg w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {activeModal === 'create'
                  ? (isRTL ? 'إضافة خدمة جديدة' : 'Add New Service')
                  : (isRTL ? 'تعديل بيانات الخدمة والأسعار' : 'Edit Service & Pricing')}
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
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#1F1C18]"
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
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#1F1C18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'القسم' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-2.5 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                  >
                    <option value="skincare">{isRTL ? 'العناية بالبشرة' : 'Skincare'}</option>
                    <option value="injectables">{isRTL ? 'الحقن التجميلي' : 'Injectables'}</option>
                    <option value="peeling">{isRTL ? 'التقشير العلاجي' : 'Peeling'}</option>
                    <option value="laser">{isRTL ? 'الليزر والتجديد' : 'Laser'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'السعر (ج.م) *' : 'Price EGP *'}
                  </label>
                  <input
                    type="number"
                    value={priceEgp}
                    onChange={(e) => setPriceEgp(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-bold text-[#1F1C18]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'أقصى سعر (اختياري)' : 'Max Price EGP'}
                  </label>
                  <input
                    type="number"
                    value={priceMaxEgp || ''}
                    onChange={(e) => setPriceMaxEgp(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 3000"
                    className="w-full px-2.5 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'مدة الجلسة (بالدقائق)' : 'Duration (Minutes)'}
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'حالة النشر' : 'Publication Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                  >
                    <option value="published">{isRTL ? 'منشور (يظهر للعملاء بالموقع)' : 'Published'}</option>
                    <option value="draft">{isRTL ? 'مسودة (محجوب عن الزوار)' : 'Draft'}</option>
                    <option value="unavailable">{isRTL ? 'غير متاح مؤقتاً' : 'Temporarily Unavailable'}</option>
                  </select>
                </div>
              </div>

              {/* Regulatory Requirement Toggle */}
              <div className="p-3 bg-[#F3ECE2] rounded-lg border border-[#DFCDB7] space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reqMed"
                    checked={requiresMedicalConsultation}
                    onChange={(e) => setRequiresMedicalConsultation(e.target.checked)}
                    className="rounded text-[#8A714C]"
                  />
                  <label htmlFor="reqMed" className="text-xs font-semibold text-[#1F1C18] cursor-pointer">
                    {isRTL
                      ? 'إجراء طبي تداخلي يتطلب فحصاً سريرياً وترخيصاً مسبقاً'
                      : 'Requires Mandatory In-Person Medical Examination & Clinical Licensing'}
                  </label>
                </div>
                <p className="text-[11px] text-[#736B5E]">
                  {isRTL
                    ? 'سيتم إظهار تنبيه للعميل بأن الخدمة تتطلب كشفاً وتقييماً طبياً قبل الجلسة.'
                    : 'A clinical disclaimer will be displayed stating preliminary doctor consultation is required.'}
                </p>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الوصف بالعربية' : 'Description (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الوصف بالإنجليزية' : 'Description (English)'}
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'رابط الصورة (URL)' : 'Image URL'}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
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
                  {isSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الخدمة' : 'Save Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-xl max-w-sm w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {isRTL ? 'تأكيد حذف الخدمة' : 'Confirm Service Deletion'}
              </h3>
            </div>
            <p className="text-xs text-[#696052] leading-relaxed">
              {isRTL
                ? 'هل أنتِ متأكدة من رغبتكِ في حذف هذه الخدمة نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to permanently delete this service? This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEC8]">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-medium text-[#5C5447] hover:bg-[#EAE0D3] rounded cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-medium cursor-pointer"
              >
                {isRTL ? 'نعم، حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
