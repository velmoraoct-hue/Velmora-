import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';
import { recordExpense } from '../../services/dataService';
import { Receipt, Plus, Download, Tag, Calendar, MapPin } from 'lucide-react';

interface AdminExpensesProps {
  expenses: Expense[];
  onRefresh: () => void;
}

export const AdminExpenses: React.FC<AdminExpensesProps> = ({ expenses, onRefresh }) => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [activeModal, setActiveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('medical_supplies');
  const [description, setDescription] = useState('');
  const [amountEgp, setAmountEgp] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState<'october' | 'zayed' | 'general'>('general');

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amountEgp || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amountEgp <= 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';

    try {
      await recordExpense(
        {
          category,
          description: description.trim(),
          amountEgp: Number(amountEgp),
          date,
          branch,
          recordedBy: actorEmail
        },
        actorEmail
      );
      setActiveModal(false);
      setDescription('');
      setAmountEgp(0);
      onRefresh();
    } catch (e) {
      console.error('Error saving expense:', e);
      setErrorMessage(isRTL ? 'تعذر حفظ المصروف.' : 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'medical_supplies':
        return isRTL ? 'مستلزمات طبية وأدوية' : 'Medical Supplies';
      case 'rent':
        return isRTL ? 'إيجار العيادة' : 'Clinic Rent';
      case 'utilities':
        return isRTL ? 'فواتير ومرافق' : 'Utilities & Electricity';
      case 'marketing':
        return isRTL ? 'تسويق وإعلانات' : 'Marketing & Ads';
      case 'salaries':
        return isRTL ? 'رواتب ومكافآت' : 'Salaries & Payroll';
      case 'maintenance':
        return isRTL ? 'صيانة وأجهزة' : 'Equipment Maintenance';
      case 'other':
        return isRTL ? 'مصاريف أخرى' : 'Other General';
    }
  };

  const exportExpensesCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Expense ID', 'Category', 'Description', 'Amount (EGP)', 'Date', 'Branch', 'Recorded By'];
    const rows = expenses.map((e) => [
      e.id,
      e.category,
      `"${e.description}"`,
      e.amountEgp,
      e.date,
      e.branch,
      e.recordedBy
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velmora_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'سجل المصروفات التشغيلية' : 'Clinic Expense Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? `إجمالي المصروفات المسجلة: ${totalExpenseAmount.toLocaleString()} ج.م (${expenses.length} بند)`
              : `Total recorded expenses: ${totalExpenseAmount.toLocaleString()} EGP (${expenses.length} items)`}
          </p>
          {errorMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportExpensesCSV}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#F3ECE2] text-[#3A3328] border border-[#DFCDB8] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8A714C]" />
            <span>{isRTL ? 'تصدير (CSV)' : 'Export'}</span>
          </button>

          <button
            onClick={() => setActiveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A265]" />
            <span>{isRTL ? 'تسجيل مصروف جديد' : 'Record Expense'}</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-[#736B5E] text-sm">
            {isRTL ? 'لا توجد مصروفات مسجلة حتى الآن.' : 'No expenses recorded yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-start">
              <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-3 px-4">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3 px-4">{isRTL ? 'البند / التصنيف' : 'Category'}</th>
                  <th className="py-3 px-4">{isRTL ? 'البيان / الوصف' : 'Description'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الفرع' : 'Branch'}</th>
                  <th className="py-3 px-4">{isRTL ? 'المبلغ (ج.م)' : 'Amount (EGP)'}</th>
                  <th className="py-3 px-4">{isRTL ? 'المسؤول' : 'Recorded By'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#5D5548]" dir="ltr">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#8A714C]">
                      {getCategoryLabel(exp.category)}
                    </td>
                    <td className="py-3.5 px-4 text-[#1F1C18]">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 text-[#736B5E]">
                      {exp.branch === 'october' ? (isRTL ? 'أكتوبر' : 'October') : exp.branch === 'zayed' ? (isRTL ? 'زايد' : 'Zayed') : (isRTL ? 'عام' : 'General')}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-rose-800">
                      {exp.amountEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#8C8476] text-[11px]">
                      {exp.recordedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-xl max-w-md w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {isRTL ? 'تسجيل بند مصروف تشغيلي' : 'Record Clinic Expense'}
              </h3>
              <button onClick={() => setActiveModal(false)} className="text-[#786F62] hover:text-[#1F1C18]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'تصنيف المصروف' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                >
                  <option value="medical_supplies">{isRTL ? 'مستلزمات طبية وأدوية' : 'Medical Supplies'}</option>
                  <option value="rent">{isRTL ? 'إيجار العيادة' : 'Clinic Rent'}</option>
                  <option value="salaries">{isRTL ? 'رواتب وأجور الموظفين' : 'Salaries & Payroll'}</option>
                  <option value="marketing">{isRTL ? 'تسويق وإعلانات' : 'Marketing & Ads'}</option>
                  <option value="utilities">{isRTL ? 'فواتير ومرافق' : 'Utilities & Electricity'}</option>
                  <option value="maintenance">{isRTL ? 'صيانة وأجهزة' : 'Equipment Maintenance'}</option>
                  <option value="other">{isRTL ? 'مصاريف أخرى' : 'Other General'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'البيان / التفاصيل *' : 'Description *'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isRTL ? 'مثال: شراء أمبولات فيلر، فاتورة كهرباء شهرية...' : 'e.g. Purchase of hyaluronic ampoules...'}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'المبلغ بالجنيه (ج.م) *' : 'Amount (EGP) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amountEgp || ''}
                    onChange={(e) => setAmountEgp(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'الفرع المستفيد' : 'Branch'}
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                >
                  <option value="general">{isRTL ? 'عام (شامل الفرعين)' : 'General / Shared'}</option>
                  <option value="october">{isRTL ? 'فرع 6 أكتوبر' : '6th of October'}</option>
                  <option value="zayed">{isRTL ? 'فرع الشيخ زايد' : 'Sheikh Zayed'}</option>
                </select>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-white rounded text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'تسجيل المصروف' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
