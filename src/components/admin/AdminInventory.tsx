import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem, InventoryCategory } from '../../types';
import { saveInventoryItem } from '../../services/dataService';
import { Boxes, AlertTriangle, Plus, CheckCircle, Package } from 'lucide-react';

interface AdminInventoryProps {
  inventory: InventoryItem[];
  onRefresh: () => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ inventory, onRefresh }) => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [activeModal, setActiveModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('filler');
  const [quantity, setQuantity] = useState<number>(10);
  const [minThreshold, setMinThreshold] = useState<number>(5);
  const [unit, setUnit] = useState('Piece');
  const [costPerUnitEgp, setCostPerUnitEgp] = useState<number>(500);

  const openCreate = () => {
    setEditingItem(null);
    setName('');
    setCategory('filler');
    setQuantity(10);
    setMinThreshold(5);
    setUnit('Piece');
    setCostPerUnitEgp(500);
    setActiveModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setMinThreshold(item.minThreshold);
    setUnit(item.unit);
    setCostPerUnitEgp(item.costPerUnitEgp);
    setActiveModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    const id = editingItem ? editingItem.id : 'inv-' + Date.now().toString(36);

    const payload: InventoryItem = {
      id,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      minThreshold: Number(minThreshold),
      unit: unit.trim(),
      costPerUnitEgp: Number(costPerUnitEgp)
    };

    try {
      await saveInventoryItem(payload, actorEmail);
      setActiveModal(false);
      onRefresh();
    } catch (e) {
      console.error('Error saving inventory item:', e);
      setErrorMessage(isRTL ? 'تعذر حفظ المستلزم.' : 'Failed to save item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAdjustQty = async (item: InventoryItem, delta: number) => {
    const actorEmail = staffUser?.email || 'admin@velmora.eg';
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await saveInventoryItem({ ...item, quantity: newQty }, actorEmail);
      onRefresh();
    } catch (e) {
      console.error('Quick adjust error:', e);
    }
  };

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minThreshold);

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
            {isRTL ? 'المخزون والمستلزمات الطبية' : 'Inventory & Consumables'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E]">
            {isRTL
              ? 'متابعة أمبولات الفيلر، البوتوكس، إبر الديرمابن، وكريمات التقشير المعقمة'
              : 'Track sterile syringes, botox vials, cartridges, and peeling solutions'}
          </p>
          {errorMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'إضافة صنف للمخزن' : 'Add Inventory Item'}</span>
        </button>
      </div>

      {/* Low stock alert box */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">
              {isRTL
                ? `تنبيه نقص المخزون: هناك ${lowStockItems.length} صنف وصل للحد الأدنى!`
                : `Low Stock Alert: ${lowStockItems.length} item(s) below reorder threshold!`}
            </span>
            <p>
              {lowStockItems.map((i) => `${i.name} (المتبقي: ${i.quantity} ${i.unit})`).join(' ، ')}
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-xs text-start">
            <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
              <tr>
                <th className="py-3 px-4">{isRTL ? 'اسم الصنف والمستلزم' : 'Item Name'}</th>
                <th className="py-3 px-4">{isRTL ? 'التصنيف' : 'Category'}</th>
                <th className="py-3 px-4">{isRTL ? 'الكمية المتوفرة' : 'Stock Level'}</th>
                <th className="py-3 px-4">{isRTL ? 'الحد الأدنى' : 'Min Threshold'}</th>
                <th className="py-3 px-4">{isRTL ? 'تكلفة الوحدة (ج.م)' : 'Cost/Unit (EGP)'}</th>
                <th className="py-3 px-4 text-center">{isRTL ? 'تعديل سريع' : 'Quick Adjust'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE1D3] bg-white">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1F1C18]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-[#8A714C]">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-700' : 'text-[#1F1C18]'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {isLow && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {isRTL ? 'منخفض' : 'Low'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#736B5E] font-mono">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-semibold text-[#1F1C18]">
                      {item.costPerUnitEgp.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickAdjustQty(item, -1)}
                          className="w-6 h-6 rounded bg-[#F3ECE2] hover:bg-[#EAE0D1] text-[#1F1C18] font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="Decrease 1"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleQuickAdjustQty(item, 1)}
                          className="w-6 h-6 rounded bg-[#F3ECE2] hover:bg-[#EAE0D1] text-[#1F1C18] font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="Increase 1"
                        >
                          +
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="px-2 py-1 bg-white hover:bg-[#F3ECE2] border border-[#DECDB8] rounded text-[11px] font-medium text-[#4A4337] cursor-pointer ml-1"
                        >
                          {isRTL ? 'تعديل' : 'Edit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-xl max-w-md w-full p-6 space-y-4 border border-[#DECDB8] shadow-2xl text-start">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18]">
                {editingItem ? (isRTL ? 'تعديل بيانات الصنف' : 'Edit Item') : (isRTL ? 'إضافة صنف جديد' : 'New Item')}
              </h3>
              <button onClick={() => setActiveModal(false)} className="text-[#786F62] hover:text-[#1F1C18]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'اسم الصنف أو المستحضر *' : 'Item Name *'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  >
                    <option value="filler">Filler (فيلر)</option>
                    <option value="botox">Botox (بوتوكس)</option>
                    <option value="peel">Peel (محاليل تقشير)</option>
                    <option value="serum">Serum / Exosome (سيروم)</option>
                    <option value="consumable">Consumable (إبر ومستهلكات)</option>
                    <option value="cleanser">Cleanser (غسول ومطهر)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'وحدة القياس' : 'Unit'}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Piece, Seringe, Vial, Kit..."
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الكمية المتوفرة' : 'Current Quantity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الحد الأدنى للتنبيه' : 'Min Threshold'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#4A4337]">
                  {isRTL ? 'سعر التكلفة للوحدة (ج.م)' : 'Cost Per Unit (EGP)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPerUnitEgp}
                  onChange={(e) => setCostPerUnitEgp(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#D8CBB7] rounded-lg text-xs font-bold"
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
                  {isSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الصنف' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
