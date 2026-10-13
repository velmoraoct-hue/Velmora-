import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Transaction, Expense, Booking } from '../../types';
import { TrendingUp, Receipt, Scale, Download, DollarSign, PieChart, CalendarCheck } from 'lucide-react';

interface AdminFinancialReportsProps {
  transactions: Transaction[];
  expenses: Expense[];
  bookings: Booking[];
}

export const AdminFinancialReports: React.FC<AdminFinancialReportsProps> = ({
  transactions,
  expenses,
  bookings
}) => {
  const { isRTL } = useLanguage();

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amountEgp || 0), 0);
  const totalExpenses = expenses.reduce((sum, ex) => sum + (ex.amountEgp || 0), 0);
  const netOperating = totalRevenue - totalExpenses;

  // Breakdown by payment method
  const revenueByPaymentMethod = transactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.amountEgp;
    return acc;
  }, {} as Record<string, number>);

  // Breakdown by expense category
  const expenseByCategory = expenses.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + ex.amountEgp;
    return acc;
  }, {} as Record<string, number>);

  const exportFinancialCSV = () => {
    const lines = [
      'VELMORA AESTHETICS - FINANCIAL OPERATING REPORT',
      `Date Generated: ${new Date().toISOString()}`,
      '',
      'SUMMARY METRICS',
      `Total Recorded Revenue (EGP),${totalRevenue}`,
      `Total Recorded Expenses (EGP),${totalExpenses}`,
      `Net Operating Result (EGP),${netOperating}`,
      '',
      'TRANSACTIONS LOG',
      'Transaction ID,Customer,Service,Amount (EGP),Payment Method,Date,Recorded By',
      ...transactions.map(t => `${t.id},"${t.customerName}","${t.serviceName}",${t.amountEgp},${t.paymentMethod},${t.date},${t.recordedBy}`),
      '',
      'EXPENSES LOG',
      'Expense ID,Category,Description,Amount (EGP),Date,Recorded By',
      ...expenses.map(e => `${e.id},${e.category},"${e.description}",${e.amountEgp},${e.date},${e.recordedBy}`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velmora_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'التقارير المالية والتدفق النقدي' : 'Revenue & Financial Operating Reports'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'بيانات حقيقية مستخرجة من واقع الجلسات المكتملة والمعاملات المقيدة فقط'
              : 'Empirically derived from recorded completed appointments and clinic expense vouchers'}
          </p>
        </div>

        <button
          onClick={exportFinancialCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'تصدير التقرير المالي الشامل (CSV)' : 'Export Full Financial Report'}</span>
        </button>
      </div>

      {/* Primary 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'إجمالي الإيرادات المقبوضة' : 'Gross Recorded Revenue'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-900">
            {totalRevenue.toLocaleString()}{' '}
            <span className="text-xs font-sans font-normal text-[#8A714C]">
              {isRTL ? 'ج.م' : 'EGP'}
            </span>
          </div>
          <div className="text-[11px] text-[#786F62]">
            {transactions.length} {isRTL ? 'معاملة مقيدة' : 'recorded transactions'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'إجمالي المصروفات المنصرفة' : 'Total Operating Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-rose-900">
            {totalExpenses.toLocaleString()}{' '}
            <span className="text-xs font-sans font-normal text-[#8A714C]">
              {isRTL ? 'ج.م' : 'EGP'}
            </span>
          </div>
          <div className="text-[11px] text-[#786F62]">
            {expenses.length} {isRTL ? 'بند مصروفات مسجل' : 'recorded expense vouchers'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#DECDB8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#736B5E]">
              {isRTL ? 'صافي نتيجة التشغيل' : 'Net Operating Result'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFE8DC] text-[#8A714C] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-serif font-bold ${netOperating >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            {netOperating.toLocaleString()}{' '}
            <span className="text-xs font-sans font-normal text-[#8A714C]">
              {isRTL ? 'ج.م' : 'EGP'}
            </span>
          </div>
          <div className="text-[11px] text-[#786F62]">
            {netOperating >= 0
              ? (isRTL ? 'فائض تشغيلي إيجابي' : 'Net operating surplus')
              : (isRTL ? 'عجز تشغيلي مؤقت' : 'Net operating deficit')}
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
            {isRTL ? 'توزيع الإيراد بحسب وسيلة الدفع' : 'Revenue by Payment Method'}
          </h3>
          {Object.keys(revenueByPaymentMethod).length === 0 ? (
            <p className="text-xs text-[#786F62] py-4">{isRTL ? 'لا توجد معاملات بعد.' : 'No transactions yet.'}</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(revenueByPaymentMethod).map(([method, amount]) => {
                const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#3A3329] uppercase">{method.replace('_', ' ')}</span>
                      <span className="font-serif font-bold">{amount.toLocaleString()} EGP ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#F3ECE2] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#8A714C] h-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
            {isRTL ? 'توزيع المصروفات بحسب البنود' : 'Expenses by Category'}
          </h3>
          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="text-xs text-[#786F62] py-4">{isRTL ? 'لا توجد مصروفات بعد.' : 'No expenses yet.'}</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expenseByCategory).map(([cat, amount]) => {
                const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#3A3329] uppercase">{cat.replace('_', ' ')}</span>
                      <span className="font-serif font-bold">{amount.toLocaleString()} EGP ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#F3ECE2] h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-700 h-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Recent Income Transactions Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs space-y-3 p-4">
        <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
          {isRTL ? 'سجل المقبوضات النقدية والتحويلات' : 'Recorded Income Transactions'}
        </h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-[#736B5E] text-center py-6">
            {isRTL ? 'لا توجد مقبوضات مسجلة بعد. عند إتمام الحجز يمكنكِ تسجيل المقبوضات مباشرة.' : 'No recorded transactions yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs text-start">
              <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isRTL ? 'العميل' : 'Customer'}</th>
                  <th className="py-2.5 px-3">{isRTL ? 'الخدمة' : 'Service'}</th>
                  <th className="py-2.5 px-3">{isRTL ? 'وسيلة الدفع' : 'Method'}</th>
                  <th className="py-2.5 px-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2 px-3 font-mono" dir="ltr">{tx.date}</td>
                    <td className="py-2 px-3 font-medium">{tx.customerName}</td>
                    <td className="py-2 px-3 text-[#5D5548]">{tx.serviceName}</td>
                    <td className="py-2 px-3 uppercase text-[11px] font-mono text-[#8A714C]">{tx.paymentMethod}</td>
                    <td className="py-2 px-3 font-serif font-bold text-emerald-800">
                      {tx.amountEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
