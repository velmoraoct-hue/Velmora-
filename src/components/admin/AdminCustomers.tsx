import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Customer } from '../../types';
import { Users, Search, Phone, Calendar, DollarSign, Download, MessageCircle } from 'lucide-react';

interface AdminCustomersProps {
  customers: Customer[];
  onRefresh: () => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers }) => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, searchQuery]);

  const exportCustomersCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Customer Name', 'Phone', 'Total Appointments', 'Total Spent (EGP)', 'Last Visit'];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      c.totalAppointments || 1,
      c.totalSpentEgp || 0,
      c.lastVisitDate || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velmora_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'سجل ودليل العملاء' : 'Customer Directory'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? `إجمالي العملاء المسجلين: ${customers.length} عميل`
              : `Total registered clients: ${customers.length}`}
          </p>
        </div>

        <button
          onClick={exportCustomersCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F3ECE2] text-[#3A3328] border border-[#DFCDB8] rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#8A714C]" />
          <span>{isRTL ? 'تصدير سجل العملاء (CSV)' : 'Export Customers'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRTL ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by client name or phone...'}
          className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-[#D8CBB7] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#A88756]"
        />
        <Search className={`w-4 h-4 text-[#8C8476] absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'}`} />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#736B5E] text-sm">
            {isRTL ? 'لا يوجد عملاء مسجلون حالياً.' : 'No customers recorded.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-start">
              <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-3 px-4">{isRTL ? 'اسم العميل' : 'Client Name'}</th>
                  <th className="py-3 px-4">{isRTL ? 'رقم الهاتف' : 'Phone'}</th>
                  <th className="py-3 px-4">{isRTL ? 'عدد الجلسات' : 'Visits'}</th>
                  <th className="py-3 px-4">{isRTL ? 'إجمالي الإنفاق (ج.م)' : 'Total Spent (EGP)'}</th>
                  <th className="py-3 px-4">{isRTL ? 'آخر زيارة' : 'Last Visit'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'تواصل' : 'Contact'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1F1C18] text-sm">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#5D5548]" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 text-[#1F1C18] font-medium">
                      {c.totalAppointments || 1} {isRTL ? 'جلسة' : 'visits'}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-emerald-800">
                      {(c.totalSpentEgp || 0).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </td>
                    <td className="py-3.5 px-4 text-[#736B5E]" dir="ltr">
                      {c.lastVisitDate || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `مرحباً ${c.name}، نتمنى أن تكوني بأفضل حال. نتواصل معكِ من عيادة ڤيلمورا (VELMORA) للاطمئنان على نتائج جلستكِ.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'واتساب' : 'WhatsApp'}</span>
                      </a>
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
