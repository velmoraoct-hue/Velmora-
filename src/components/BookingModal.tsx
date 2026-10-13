import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Service, Practitioner, BranchCode, Booking } from '../types';
import { createBookingRequest, checkSlotAvailable } from '../services/dataService';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  practitioners: Practitioner[];
  preselectedServiceId?: string;
  preselectedPractitionerId?: string;
}

const AVAILABLE_TIME_SLOTS = [
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '08:00 PM'
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  practitioners,
  preselectedServiceId,
  preselectedPractitionerId
}) => {
  const { language, isRTL, t } = useLanguage();

  const publishedServices = services.filter((s) => s.status === 'published');

  // Form states
  const [serviceId, setServiceId] = useState<string>('');
  const [branch, setBranch] = useState<BranchCode>('october');
  const [practitionerId, setPractitionerId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('12:00 PM');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Set default min date to tomorrow or today
  const minDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessBookingId(null);
      if (preselectedServiceId) {
        setServiceId(preselectedServiceId);
      } else if (publishedServices.length > 0 && !serviceId) {
        setServiceId(publishedServices[0].id);
      }
      if (preselectedPractitionerId) {
        setPractitionerId(preselectedPractitionerId);
      }
      if (!appointmentDate) {
        // default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setAppointmentDate(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, preselectedServiceId, preselectedPractitionerId, publishedServices]);

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedPractitioner = practitioners.find((p) => p.id === practitionerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage(isRTL ? 'يرجى إدخال اسم العميل بشكل صحيح.' : 'Please enter a valid customer name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage(isRTL ? 'يرجى إدخال رقم هاتف صحيح للتواصل (يفضل رقم مصري).' : 'Please enter a valid phone number.');
      return;
    }

    if (!selectedService) {
      setErrorMessage(isRTL ? 'يرجى اختيار الخدمة المطلوبة.' : 'Please select a service.');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setErrorMessage(isRTL ? 'يرجى تحديد تاريخ ووقت الجلسة.' : 'Please select a date and time.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verify slot availability against double booking
      const isSlotFree = await checkSlotAvailable(branch, appointmentDate, appointmentTime);
      if (!isSlotFree) {
        setErrorMessage(t('booking.bookedSlotWarning'));
        setIsSubmitting(false);
        return;
      }

      // 2. Submit booking request with status: pending
      const res = await createBookingRequest({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        serviceId: selectedService.id,
        serviceNameAr: selectedService.nameAr,
        serviceNameEn: selectedService.nameEn,
        practitionerId: selectedPractitioner?.id || undefined,
        practitionerName: selectedPractitioner
          ? (language === 'ar' ? selectedPractitioner.nameAr : selectedPractitioner.nameEn)
          : undefined,
        branch,
        appointmentDate,
        appointmentTime,
        priceEgp: selectedService.priceEgp,
        notes: notes.trim() || undefined
      });

      if (res.success && res.id) {
        setSuccessBookingId(res.id);
      } else {
        setErrorMessage(
          res.error === 'SLOT_OCCUPIED'
            ? t('booking.bookedSlotWarning')
            : (isRTL ? 'تعذر إرسال الحجز حالياً، يرجى المحاولة لاحقاً.' : 'Booking failed. Please try again.')
        );
      }
    } catch (err) {
      setErrorMessage(isRTL ? 'حدث خطأ أثناء تسجيل الحجز.' : 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessBookingId(null);
    setErrorMessage(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#DECDB8] overflow-hidden my-auto text-start max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#F3ECE2] border-b border-[#E2D5C3] flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-widest text-[#8A714C] font-semibold">
              VELMORA CLINICAL RESERVATION
            </span>
            <h3 className="text-xl font-serif font-medium text-[#1F1C18]">
              {t('booking.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#736B5E] hover:text-[#1F1C18] hover:bg-[#EAE0D1] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* SUCCESS SCREEN */}
          {successBookingId ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-2xl font-serif font-medium text-[#1F1C18]">
                  {t('booking.successTitle')}
                </h4>
                <div className="inline-block px-4 py-1.5 rounded-lg bg-[#F3ECE2] border border-[#DFCDB7] text-sm font-mono font-bold text-[#8A714C]">
                  {t('booking.successRef')}: {successBookingId}
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-xl bg-white border border-[#E4D9C8] text-xs sm:text-sm text-start space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#EFEBE4] pb-2">
                  <span className="text-[#736B5E]">{isRTL ? 'الخدمة المطلوبة:' : 'Requested Service:'}</span>
                  <span className="font-semibold text-[#1F1C18]">
                    {selectedService && (language === 'ar' ? selectedService.nameAr : selectedService.nameEn)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#EFEBE4] pb-2">
                  <span className="text-[#736B5E]">{isRTL ? 'الفرع:' : 'Branch:'}</span>
                  <span className="font-semibold text-[#1F1C18]">
                    {branch === 'october' ? (isRTL ? 'مدينة 6 أكتوبر' : '6th of October') : (isRTL ? 'الشيخ زايد' : 'Sheikh Zayed')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#EFEBE4] pb-2">
                  <span className="text-[#736B5E]">{isRTL ? 'الموعد المطلوب:' : 'Slot:'}</span>
                  <span className="font-semibold text-[#1F1C18]" dir="ltr">
                    {appointmentDate} @ {appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">{isRTL ? 'حالة الطلب:' : 'Request Status:'}</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {isRTL ? 'قيد التأكيد (Pending)' : 'Pending Confirmation'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F3ECE2] rounded-xl border border-[#DFCDB7] text-xs sm:text-sm text-[#5C5447] leading-relaxed max-w-lg mx-auto space-y-2">
                <p>{t('booking.successMsg')}</p>
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <span>✉️</span>
                  <span>
                    {isRTL
                      ? 'تم إرسال إشعار بريدي آلي بتفاصيل الحجز وتنبيه إدارة العيادة عبر البريد الإلكتروني.'
                      : 'An automated email confirmation was sent and the clinic administration was alerted.'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/20102345678?text=${encodeURIComponent(
                    `مرحباً عيادة ڤيلمورا، أود الاستفسار عن تأكيد حجزي برقم ${successBookingId}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs sm:text-sm font-medium transition-colors"
                >
                  {isRTL ? 'متابعة الحجز عبر واتساب' : 'Follow up via WhatsApp'}
                </a>
                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#FAF7F2] hover:bg-[#F0E6D6] text-[#4A4337] border border-[#D5C7B2] rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  {t('booking.newBooking')}
                </button>
              </div>
            </div>
          ) : (
            /* BOOKING FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Service Selection */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                  {t('booking.step1')}
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  required
                >
                  {publishedServices.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {language === 'ar' ? svc.nameAr : svc.nameEn} — {svc.priceEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'} ({svc.durationMinutes} {t('services.minutes')})
                    </option>
                  ))}
                </select>

                {/* Service hint */}
                {selectedService && (
                  <div className="p-3 rounded-lg bg-[#F4EDE2] border border-[#E3D6C1] text-xs text-[#5D5547] flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#A88756] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1F1C18]">
                        {language === 'ar' ? selectedService.nameAr : selectedService.nameEn}
                      </p>
                      <p className="mt-0.5 text-[#696053]">
                        {language === 'ar' ? selectedService.descriptionAr : selectedService.descriptionEn}
                      </p>
                      {selectedService.requiresMedicalConsultation && (
                        <p className="mt-1 text-amber-800 font-medium">
                          ⚠️ {t('services.consultationRequired')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Branch & Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.branch')}
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as BranchCode)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  >
                    <option value="october">{t('booking.branch.october')}</option>
                    <option value="zayed">{t('booking.branch.zayed')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.selectPractitioner')}
                  </label>
                  <select
                    value={practitionerId}
                    onChange={(e) => setPractitionerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  >
                    <option value="">{t('booking.anyPractitioner')}</option>
                    {practitioners
                      .filter((p) => p.isActive)
                      .map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {language === 'ar' ? doc.nameAr : doc.nameEn}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.date')}
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.time')}
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                    dir="ltr"
                  >
                    {AVAILABLE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 4: Customer Details */}
              <div className="space-y-4 pt-2 border-t border-[#E8DEC8]">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.name')} *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isRTL ? 'الاسم ثلاثي أو ثنائي' : 'Full Name'}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={t('booking.phonePlaceholder')}
                    required
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  />
                  <span className="text-[11px] text-[#786F62] block">
                    {isRTL
                      ? 'سيتم التواصل عبر هذا الرقم لتأكيد الحجز وموعد الحضور.'
                      : 'Confirmation call or WhatsApp message will be sent to this number.'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {isRTL ? 'البريد الإلكتروني (لتلقي إشعار التأكيد التلقائي)' : 'Email Address (for instant confirmation)'}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  />
                  <span className="text-[11px] text-[#786F62] block">
                    {isRTL
                      ? 'ستصلكِ نسخة كاملة من تفاصيل الحجز عبر البريد فور إرسال الطلب.'
                      : 'An automated email confirmation voucher will be sent to this address.'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#544B3F]">
                    {t('booking.notes')}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('booking.notesPlaceholder')}
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs sm:text-sm text-[#24201A] focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
                  />
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3 bg-[#F3ECE2] rounded-lg border border-[#DFCDB7] text-[11px] text-[#696052] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A88756] shrink-0" />
                <span>
                  {isRTL
                    ? 'الحجز عبر الموقع يعتبر طلباً مبدئياً يخضع لتأكيد موظف الاستقبال خلال دقائق.'
                    : 'Online submissions are pending requests subject to front-desk phone/WhatsApp confirmation.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs sm:text-sm font-medium text-[#5C5447] hover:bg-[#EAE0D3] rounded-md transition-colors cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-[#1F1C18] hover:bg-[#342E26] text-[#FAF7F2] text-xs sm:text-sm font-medium rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t('booking.submitting') : t('booking.submit')}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
