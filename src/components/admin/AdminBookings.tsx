import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, BookingStatus, PaymentMethod } from '../../types';
import { updateBookingStatus, recordTransaction, triggerBookingEmailNotification } from '../../services/dataService';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MapPin,
  ChevronDown,
  DollarSign,
  Mail
} from 'lucide-react';

interface AdminBookingsProps {
  bookings: Booking[];
  onRefresh: () => void;
  selectedBookingForStatus?: Booking | null;
  onClearSelectedBooking?: () => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  bookings,
  onRefresh,
  selectedBookingForStatus,
  onClearSelectedBooking
}) => {
  const { language, isRTL } = useLanguage();
  const { staffUser, isOwnerOrAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Status modal
  const [activeBooking, setActiveBooking] = useState<Booking | null>(selectedBookingForStatus || null);
  const [newStatus, setNewStatus] = useState<BookingStatus>('confirmed');
  const [cancellationReason, setCancellationReason] = useState<string>('');
  
  // Optional transaction recording when completing
  const [recordPaymentOnComplete, setRecordPaymentOnComplete] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (selectedBookingForStatus) {
      setActiveBooking(selectedBookingForStatus);
      setNewStatus(selectedBookingForStatus.status);
      setPaidAmount(selectedBookingForStatus.priceEgp || 0);
    }
  }, [selectedBookingForStatus]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (branchFilter !== 'all' && b.branch !== branchFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.customerName.toLowerCase().includes(q);
        const matchesPhone = b.customerPhone.includes(q);
        const matchesService = (b.serviceNameAr + b.serviceNameEn).toLowerCase().includes(q);
        const matchesId = b.id.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesService || matchesId;
      }

      return true;
    });
  }, [bookings, statusFilter, branchFilter, searchQuery]);

  const handleOpenStatusModal = (booking: Booking) => {
    setActiveBooking(booking);
    setNewStatus(booking.status);
    setPaidAmount(booking.priceEgp || 0);
    setCancellationReason('');
  };

  const handleCloseStatusModal = () => {
    setActiveBooking(null);
    if (onClearSelectedBooking) onClearSelectedBooking();
  };

  const handleSaveStatus = async () => {
    if (!activeBooking) return;
    setIsUpdating(true);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';

    try {
      await updateBookingStatus(
        activeBooking.id,
        newStatus,
        actorEmail,
        newStatus === 'cancelled' ? cancellationReason : undefined
      );

      // If completing and record payment selected
      if (newStatus === 'completed' && recordPaymentOnComplete && paidAmount > 0 && isOwnerOrAdmin) {
        await recordTransaction({
          bookingId: activeBooking.id,
          customerName: activeBooking.customerName,
          serviceName: activeBooking.serviceNameAr || activeBooking.serviceNameEn,
          amountEgp: paidAmount,
          paymentMethod,
          date: new Date().toISOString().split('T')[0],
          branch: activeBooking.branch,
          recordedBy: actorEmail,
          notes: `Automatic revenue record on appointment completion (${activeBooking.id})`
        }, actorEmail);
      }

      handleCloseStatusModal();
      onRefresh();
    } catch (e) {
      console.error('Failed to update booking status:', e);
      setNotification({
        type: 'error',
        message: isRTL ? 'تعذر تحديث حالة الحجز.' : 'Failed to update booking status.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) return;
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Service', 'Branch', 'Date', 'Time', 'Status', 'Price EGP'];
    const rows = filteredBookings.map((b) => [
      b.id,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.serviceNameEn || b.serviceNameAr}"`,
      b.branch,
      b.appointmentDate,
      b.appointmentTime,
      b.status,
      b.priceEgp || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velmora_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-semibold">{isRTL ? 'قيد المراجعة' : 'Pending'}</span>;
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold">{isRTL ? 'مؤكد' : 'Confirmed'}</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold">{isRTL ? 'مكتمل' : 'Completed'}</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded text-xs font-semibold">{isRTL ? 'ملغي' : 'Cancelled'}</span>;
      case 'no-show':
        return <span className="bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-0.5 rounded text-xs font-semibold">{isRTL ? 'لم يحضر' : 'No-Show'}</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'إدارة ومتابعة الحجوزات' : 'Bookings Management'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? `إجمالي الحجوزات المسجلة: ${bookings.length} حجز`
              : `Total recorded bookings: ${bookings.length}`}
          </p>
          {notification && (
            <div
              className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                notification.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <span>{notification.message}</span>
            </div>
          )}
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F3ECE2] text-[#3A3328] border border-[#DFCDB8] rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#8A714C]" />
          <span>{isRTL ? 'تصدير البيانات (CSV)' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DECDB8] grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-xs">
        
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم، الهاتف، كود الحجز أو الخدمة...' : 'Search by client, phone, ID or service...'}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-[#D8CBB7] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
          />
          <Search className={`w-4 h-4 text-[#8C8476] absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'}`} />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D8CBB7] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
          >
            <option value="all">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="pending">{isRTL ? 'قيد المراجعة (Pending)' : 'Pending'}</option>
            <option value="confirmed">{isRTL ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
            <option value="completed">{isRTL ? 'مكتمل (Completed)' : 'Completed'}</option>
            <option value="cancelled">{isRTL ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
            <option value="no-show">{isRTL ? 'لم يحضر (No-Show)' : 'No-Show'}</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div className="sm:col-span-3">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D8CBB7] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
          >
            <option value="all">{isRTL ? 'كل الفروع' : 'All Branches'}</option>
            <option value="october">{isRTL ? 'فرع 6 أكتوبر' : '6th of October'}</option>
            <option value="zayed">{isRTL ? 'فرع الشيخ زايد' : 'Sheikh Zayed'}</option>
          </select>
        </div>

      </div>

      {/* Bookings Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-[#736B5E] text-sm">
            {isRTL ? 'لا توجد حجوزات مطابقة للبحث المحدد.' : 'No bookings found matching filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs text-start">
              <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-3 px-4">{isRTL ? 'كود الحجز' : 'Booking Ref'}</th>
                  <th className="py-3 px-4">{isRTL ? 'العميل' : 'Customer'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الخدمة' : 'Service'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الفرع' : 'Branch'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الموعد' : 'Date & Time'}</th>
                  <th className="py-3 px-4">{isRTL ? 'السعر التقديري' : 'Price (EGP)'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'إجراءات سريعة' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-medium text-[#736B5E]">
                      {b.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1F1C18]">{b.customerName}</div>
                      <div className="text-[11px] font-mono text-[#736B5E]" dir="ltr">
                        {b.customerPhone}
                      </div>
                      {b.customerEmail && (
                        <div className="text-[10px] font-mono text-[#8A714C] truncate max-w-[140px]" dir="ltr">
                          {b.customerEmail}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#332E27]">
                      <div className="font-medium">{b.serviceNameAr || b.serviceNameEn}</div>
                      {b.practitionerName && (
                        <div className="text-[11px] text-[#8A714C]">
                          {b.practitionerName}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#4A4337]">
                      {b.branch === 'october' ? (isRTL ? '6 أكتوبر' : 'October') : (isRTL ? 'الشيخ زايد' : 'Zayed')}
                    </td>

                    <td className="py-3.5 px-4 font-mono" dir="ltr">
                      <div>{b.appointmentDate}</div>
                      <div className="text-[11px] text-[#8A714C]">{b.appointmentTime}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#1F1C18]">
                      {(b.priceEgp || 0).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(b.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Send / Resend Email Notification */}
                        <button
                          onClick={async () => {
                            await triggerBookingEmailNotification(b);
                            setNotification({
                              type: 'success',
                              message: isRTL
                                ? 'تم إرسال إشعار البريد الإلكتروني الآلي (للعميل وإدارة العيادة).'
                                : 'Automated email notification triggered (customer & admin).'
                            });
                            setTimeout(() => setNotification(null), 4000);
                          }}
                          title={isRTL ? 'إرسال / إعادة إرسال إشعار البريد الإلكتروني' : 'Send / Resend Email Notification'}
                          className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Direct */}
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${b.customerName}، من عيادة ڤيلمورا (VELMORA) نؤكد موعدكِ يوم ${b.appointmentDate} الساعة ${b.appointmentTime}. يرجى تأكيد حضوركِ بالرد على هذه الرسالة.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp confirmation"
                          className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Call */}
                        <a
                          href={`tel:${b.customerPhone.replace(/\s+/g, '')}`}
                          title="Call"
                          className="p-1.5 rounded bg-[#F3ECE2] text-[#8A714C] hover:bg-[#EAE0D1] transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        {/* Status Change Button */}
                        <button
                          onClick={() => handleOpenStatusModal(b)}
                          className="px-2.5 py-1 bg-[#1F1C18] hover:bg-[#342E25] text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {isRTL ? 'تعديل الحالة' : 'Status'}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-xl max-w-md w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start">
            
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <div>
                <span className="text-[10px] text-[#8A714C] font-mono block">{activeBooking.id}</span>
                <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                  {isRTL ? 'تحديث حالة الحجز' : 'Update Booking Status'}
                </h3>
              </div>
              <button
                onClick={handleCloseStatusModal}
                className="text-[#786F62] hover:text-[#1F1C18] p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E4D9C8] text-xs space-y-1">
              <div className="font-semibold text-sm text-[#1F1C18]">{activeBooking.customerName}</div>
              <div className="text-[#5D5548]">{activeBooking.serviceNameAr || activeBooking.serviceNameEn}</div>
              <div className="text-[#736B5E]" dir="ltr">{activeBooking.appointmentDate} @ {activeBooking.appointmentTime}</div>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A4337]">
                {isRTL ? 'الحالة الجديدة:' : 'New Status:'}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-sm text-[#1F1C18]"
              >
                <option value="pending">{isRTL ? 'قيد المراجعة (Pending)' : 'Pending'}</option>
                <option value="confirmed">{isRTL ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
                <option value="completed">{isRTL ? 'مكتمل (Completed)' : 'Completed'}</option>
                <option value="cancelled">{isRTL ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
                <option value="no-show">{isRTL ? 'لم يحضر (No-Show)' : 'No-Show'}</option>
              </select>
            </div>

            {/* If cancelling, ask reason */}
            {newStatus === 'cancelled' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'سبب الإلغاء:' : 'Cancellation Reason:'}
                </label>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder={isRTL ? 'مثال: اعتذار العميل، تغيير موعد السفر...' : 'e.g. Client rescheduled...'}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs text-[#1F1C18]"
                />
              </div>
            )}

            {/* If completing and Owner/Admin, allow automatic revenue recording */}
            {newStatus === 'completed' && isOwnerOrAdmin && (
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recPay"
                    checked={recordPaymentOnComplete}
                    onChange={(e) => setRecordPaymentOnComplete(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <label htmlFor="recPay" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                    {isRTL ? 'تسجيل إيراد مالي للمعاملة في الخزينة' : 'Record financial income transaction'}
                  </label>
                </div>

                {recordPaymentOnComplete && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-emerald-800 mb-0.5">
                        {isRTL ? 'المبلغ المحصل (ج.م):' : 'Amount (EGP):'}
                      </label>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-emerald-800 mb-0.5">
                        {isRTL ? 'طريقة الدفع:' : 'Payment Method:'}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded text-xs"
                      >
                        <option value="instapay">InstaPay (إنستاباي)</option>
                        <option value="card">Card (فيزا / ماستركارد)</option>
                        <option value="cash">Cash (نقدي)</option>
                        <option value="vodafone_cash">Vodafone Cash (فودافون كاش)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={handleCloseStatusModal}
                className="px-4 py-2 text-xs font-medium text-[#5C5447] hover:bg-[#EAE0D3] rounded cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="px-5 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-white rounded text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التحديث' : 'Save Update')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
