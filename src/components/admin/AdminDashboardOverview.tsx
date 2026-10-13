import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, Transaction, Expense, Service } from '../../types';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Receipt,
  Scale,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  bookings: Booking[];
  transactions: Transaction[];
  expenses: Expense[];
  services: Service[];
  onNavigateTab: (tab: any) => void;
  onOpenQuickBookingStatus: (booking: Booking) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  bookings,
  transactions,
  expenses,
  services,
  onNavigateTab,
  onOpenQuickBookingStatus
}) => {
  const { isRTL, t } = useLanguage();
  const { isOwnerOrAdmin } = useAuth();

  // Metrics calculation strictly from real recorded data
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amountEgp || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountEgp || 0), 0);
  const netOperatingResult = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8 text-start">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8A714C] font-semibold">
            {isRTL ? 'نظرة عامة على العيادة' : 'CLINICAL OVERVIEW'}
          </span>
          <h2 className="text-2xl font-serif font-medium text-[#1F1C18] mt-1">
            {isRTL ? 'مرحباً بكِ في منظومة ڤيلمورا' : 'Welcome to VELMORA Clinic Management'}
          </h2>
          <p className="text-xs sm:text-sm text-[#696051] mt-1">
            {isRTL
              ? 'تتم مزامنة جميع الحجوزات والمعاملات مباشرة مع قاعدة بيانات السحاب.'
              : 'All appointments and recorded transactions are synchronized live.'}
          </p>
        </div>

        {/* Quick Pending Alert Badge */}
        {pendingBookings.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {isRTL
                ? `لديكِ ${pendingBookings.length} طلب حجز بحاجة للمراجعة والتأكيد!`
                : `${pendingBookings.length} booking request(s) require confirmation!`}
            </span>
          </div>
        )}
      </div>

      {/* Primary KPI Grid (Never fabricated: strictly real recorded data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Bookings */}
        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C3] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFE8DC] text-[#8A714C] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1F1C18]">
            {totalBookings}
          </div>
          <div className="text-[11px] text-[#8C8476]">
            {isRTL ? 'مسجلة في قاعدة البيانات' : 'Recorded requests'}
          </div>
        </div>

        {/* Confirmed Appointments */}
        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C3] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'مواعيد مؤكدة' : 'Confirmed'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {confirmedBookings.length}
          </div>
          <div className="text-[11px] text-[#8C8476]">
            {isRTL ? 'جاهزة للحضور' : 'Confirmed bookings'}
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C3] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'جلسات مكتملة' : 'Completed'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-blue-800">
            {completedBookings.length}
          </div>
          <div className="text-[11px] text-[#8C8476]">
            {isRTL ? 'تم تقديم الخدمة' : 'Finished sessions'}
          </div>
        </div>

        {/* Cancelled / No-show */}
        <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C3] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'ملغاة أو لم يحضر' : 'Cancelled / No-show'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-rose-800">
            {cancelledBookings.length}
          </div>
          <div className="text-[11px] text-[#8C8476]">
            {isRTL ? 'إلغاءات موثقة' : 'Cancelled bookings'}
          </div>
        </div>

      </div>

      {/* Financial Overview (Visible strictly to Owner & Admin) */}
      {isOwnerOrAdmin && (
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8A714C] font-semibold">
                FINANCIAL HEALTH & REAL RECORDED TOTALS
              </span>
              <h3 className="text-lg font-serif font-medium text-[#1F1C18]">
                {isRTL ? 'المركز المالي التشغيلي' : 'Financial & Operating Summary'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-[#8A714C] hover:text-[#1F1C18] flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>{isRTL ? 'عرض التقرير التفصيلي' : 'View Full Report'}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Revenue */}
            <div className="p-4 rounded-xl bg-white border border-[#E0D4C3] space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{isRTL ? 'إجمالي الإيرادات المحصلة' : 'Recorded Revenue'}</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#1F1C18]">
                {totalRevenue.toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-[#8A714C]">
                  {isRTL ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <p className="text-[11px] text-[#786F62]">
                {isRTL
                  ? `من واقع ${transactions.length} معاملة مقبوضة مسجلة.`
                  : `From ${transactions.length} completed transactions.`}
              </p>
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-xl bg-white border border-[#E0D4C3] space-y-1">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-medium">
                <Receipt className="w-4 h-4" />
                <span>{isRTL ? 'إجمالي المصروفات التشغيلية' : 'Recorded Expenses'}</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#1F1C18]">
                {totalExpenses.toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-[#8A714C]">
                  {isRTL ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <p className="text-[11px] text-[#786F62]">
                {isRTL
                  ? `من واقع ${expenses.length} بند مصروفات معتمد.`
                  : `From ${expenses.length} categorized clinic expense items.`}
              </p>
            </div>

            {/* Net Operating */}
            <div className="p-4 rounded-xl bg-white border border-[#E0D4C3] space-y-1">
              <div className="flex items-center gap-2 text-[#8A714C] text-xs font-medium">
                <Scale className="w-4 h-4" />
                <span>{isRTL ? 'صافي التشغيل (الأرباح/العجز)' : 'Net Operating Result'}</span>
              </div>
              <div className={`text-2xl font-serif font-bold ${netOperatingResult >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {netOperatingResult.toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-[#8A714C]">
                  {isRTL ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <p className="text-[11px] text-[#786F62]">
                {netOperatingResult >= 0
                  ? (isRTL ? 'فائض تشغيلي إيجابي بناءً على المدخلات.' : 'Positive operating surplus.')
                  : (isRTL ? 'عجز تشغيلي بناءً على المصروفات المسجلة.' : 'Operating deficit recorded.')}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Urgent Pending Bookings requiring Reception Action */}
      <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-serif font-medium text-[#1F1C18]">
              {isRTL ? 'طلبات الحجز قيد المراجعة الفورية' : 'Pending Bookings Awaiting Action'}
            </h3>
            <p className="text-xs text-[#736B5E]">
              {isRTL
                ? 'الحجوزات الواردة من الموقع العام والتي تتطلب اتصالاً هاتفياً أو تأكيد واتساب'
                : 'Customer requests pending confirmation by phone or WhatsApp'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs text-[#8A714C] hover:text-[#1F1C18] flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{isRTL ? 'كل الحجوزات' : 'All Bookings'}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="text-center py-10 bg-white/70 rounded-xl border border-dashed border-[#DDCDB8]">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1F1C18]">
              {isRTL ? 'رائع! لا توجد طلبات حجز معلقة حالياً' : 'No pending bookings! All clear.'}
            </p>
            <p className="text-xs text-[#7A7163] mt-1">
              {isRTL
                ? 'جميع طلبات الحجز تمت معالجتها وتأكيدها.'
                : 'All submitted customer requests have been processed.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE0D3] bg-white rounded-xl border border-[#E2D5C3] overflow-hidden">
            {pendingBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1F1C18]">
                      {booking.customerName}
                    </span>
                    <span className="text-xs font-mono text-[#8A714C]">
                      ({booking.customerPhone})
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                      {booking.branch === 'october' ? (isRTL ? '6 أكتوبر' : 'October') : (isRTL ? 'الشيخ زايد' : 'Zayed')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5D5548] flex items-center gap-3">
                    <span>{booking.serviceNameAr || booking.serviceNameEn}</span>
                    <span>•</span>
                    <span dir="ltr">{booking.appointmentDate} @ {booking.appointmentTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `مرحباً أستاذ/ة ${booking.customerName}، نتواصل معكِ من عيادة ڤيلمورا لتأكيد موعد حجزكِ لجلسة ${booking.serviceNameAr} بتاريخ ${booking.appointmentDate} الساعة ${booking.appointmentTime}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
                  >
                    {isRTL ? 'واتساب العميل' : 'WhatsApp Client'}
                  </a>
                  <button
                    onClick={() => onOpenQuickBookingStatus(booking)}
                    className="px-3 py-1.5 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    {isRTL ? 'تحديث الحالة' : 'Update Status'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
