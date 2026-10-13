import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Sparkles,
  Stethoscope,
  ShieldAlert,
  Tag,
  Receipt,
  Boxes,
  TrendingUp,
  FileText,
  Settings,
  History,
  LogOut,
  Globe,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  FolderOpen,
  Palette,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { PermissionKey } from '../../types';

export type AdminTab =
  | 'overview'
  | 'bookings'
  | 'customers'
  | 'services'
  | 'practitioners'
  | 'staff'
  | 'media'
  | 'branding'
  | 'offers'
  | 'expenses'
  | 'inventory'
  | 'finance'
  | 'content'
  | 'settings'
  | 'audit';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onReturnToSite: () => void;
  pendingBookingsCount: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onReturnToSite,
  pendingBookingsCount,
  children
}) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { currentUser, staffUser, staffRole, isOwner, isOwnerOrAdmin, hasPermission, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navItems: {
    id: AdminTab;
    labelAr: string;
    labelEn: string;
    icon: any;
    badge?: number;
    requiredPermission?: PermissionKey;
    adminOnly?: boolean;
  }[] = [
    { id: 'overview', labelAr: 'لوحة المؤشرات', labelEn: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'bookings',
      labelAr: 'إدارة الحجوزات',
      labelEn: 'Bookings Management',
      icon: CalendarCheck,
      badge: pendingBookingsCount,
      requiredPermission: 'bookings.read'
    },
    { id: 'customers', labelAr: 'سجل العملاء', labelEn: 'Customer Directory', icon: Users, requiredPermission: 'customers.read' },
    { id: 'services', labelAr: 'دليل الخدمات والأسعار', labelEn: 'Services & Pricing', icon: Sparkles, requiredPermission: 'services.read' },
    { id: 'practitioners', labelAr: 'الكادر الطبي', labelEn: 'Specialists & Doctors', icon: Stethoscope, requiredPermission: 'practitioners.read' },
    { id: 'staff', labelAr: 'الموظفون والصلاحيات', labelEn: 'Staff & Permissions', icon: UserCheck, requiredPermission: 'staff.read' },
    { id: 'media', labelAr: 'مكتبة الوسائط والصور', labelEn: 'Media & Assets', icon: FolderOpen },
    { id: 'branding', labelAr: 'الهوية البصرية والألوان', labelEn: 'Brand Identity', icon: Palette, requiredPermission: 'branding.read' },
    { id: 'offers', labelAr: 'الباقات والعروض', labelEn: 'Offers & Packages', icon: Tag, requiredPermission: 'offers.manage' },
    { id: 'expenses', labelAr: 'سجل المصروفات', labelEn: 'Expense Tracking', icon: Receipt, requiredPermission: 'expenses.read' },
    { id: 'inventory', labelAr: 'المخزون والمستلزمات', labelEn: 'Inventory Management', icon: Boxes, requiredPermission: 'inventory.read' },
    { id: 'finance', labelAr: 'التقارير المالية والإيراد', labelEn: 'Financial Reports', icon: TrendingUp, requiredPermission: 'finance.read' },
    { id: 'content', labelAr: 'محتوى الموقع', labelEn: 'Website Content', icon: FileText, requiredPermission: 'content.manage' },
    { id: 'settings', labelAr: 'إعدادات المركز والفروع', labelEn: 'Business Settings', icon: Settings, requiredPermission: 'settings.manage' },
    { id: 'audit', labelAr: 'سجل العمليات (Audit)', labelEn: 'Audit Trail', icon: History, requiredPermission: 'audit.read' },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (isOwner) return true;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
    if (item.adminOnly && !isOwnerOrAdmin) return false;
    return true;
  });

  const getRoleLabel = () => {
    switch (staffRole) {
      case 'owner':
        return isRTL ? 'المالك (Owner)' : 'Owner / General Director';
      case 'admin':
        return isRTL ? 'مدير النظام (Admin)' : 'Clinic Administrator';
      case 'receptionist':
        return isRTL ? 'موظف استقبال (Reception)' : 'Receptionist';
      case 'practitioner':
        return isRTL ? 'ممارس طبي (Doctor)' : 'Practitioner';
      default:
        return isRTL ? 'موظف' : 'Staff';
    }
  };

  const handleTabSelect = (tab: AdminTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const currentItem = navItems.find((i) => i.id === currentTab);

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col text-[#1F1C18]">
      {/* Top Navbar */}
      <header className="bg-[#542238] text-[#FAF5F0] border-b border-[#6E304B] px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left: Mobile hamburger + Brand & Return */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile hamburger button (min 44px touch target) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#FAF5F0] hover:bg-[#6E304B] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#C58B83]" /> : <Menu className="w-5 h-5 text-[#C58B83]" />}
          </button>

          <button
            onClick={onReturnToSite}
            className="flex items-center gap-1.5 text-xs text-[#FAF5F0] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#6E304B] hover:bg-[#7F3856] border border-[#7F3856] transition-colors cursor-pointer min-h-[40px]"
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5 text-[#C58B83]" /> : <ArrowLeft className="w-3.5 h-3.5 text-[#C58B83]" />}
            <span className="hidden xs:inline">{isRTL ? 'الموقع العام' : 'Public Site'}</span>
          </button>

          <div className="h-4 w-px bg-[#6E304B] hidden sm:block"></div>

          <div className="space-y-0.5 text-start">
            <span className="font-serif text-base sm:text-lg tracking-widest text-[#FAF5F0] font-medium block">
              VELMORA <span className="text-[10px] text-[#C58B83] font-sans font-normal tracking-wider">PORTAL</span>
            </span>
          </div>
        </div>

        {/* Right: Staff profile & controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active section title on mobile */}
          <div className="md:hidden text-xs text-[#C5A265] font-medium truncate max-w-[120px]">
            {currentItem ? (isRTL ? currentItem.labelAr : currentItem.labelEn) : ''}
          </div>

          {/* Role badge */}
          <div className="hidden lg:flex flex-col items-end text-xs">
            <span className="text-[#EDE7DE] font-medium truncate max-w-[180px]">
              {currentUser?.email || staffUser?.email || 'Authorized Staff'}
            </span>
            <span className="text-[11px] text-[#C5A265] font-mono">
              {getRoleLabel()}
            </span>
          </div>

          {/* Lang toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#2A2621] hover:bg-[#3A352D] rounded-lg border border-[#3E382E] text-[#D8CEBF] transition-colors cursor-pointer min-h-[40px]"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A265]" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-900/60 transition-colors cursor-pointer min-h-[40px]"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('admin.logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex relative">
        {/* Mobile Slide-Over Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation (Desktop fixed, Mobile off-canvas slide-over) */}
        <aside
          className={`
            fixed md:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30
            w-72 md:w-64 bg-[#FAF5F0] border-e border-[#E8DCD5] p-4 shrink-0
            flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : `${isRTL ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0`}
          `}
          style={{ top: '60px' }}
        >
          <div className="space-y-1 pb-6">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-[#542238] flex items-center justify-between">
              <span>{isRTL ? 'أقسام الإدارة والتشغيل' : 'CLINICAL OPERATIONS'}</span>
              <span className="text-[10px] text-[#B69AA8] font-mono">{filteredNavItems.length}</span>
            </div>

            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const label = isRTL ? item.labelAr : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-start cursor-pointer ${
                    isActive
                      ? 'bg-[#542238] text-[#FAF5F0] shadow-xs font-semibold'
                      : 'text-[#1F1C18] hover:bg-[#F3EBE3] hover:text-[#542238]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C58B83]' : 'text-[#8A714C]'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RBAC Notice Card */}
          <div className="mt-4 p-3 rounded-xl bg-white/80 border border-[#E8DCD5] text-[11px] text-[#5A4E54] text-start">
            <div className="flex items-center gap-1.5 font-semibold text-[#542238] mb-1">
              <Shield className="w-3.5 h-3.5 text-[#C58B83]" />
              <span>{isRTL ? 'نظام الأمان والصلاحيات' : 'Active Privileges'}</span>
            </div>
            <p className="leading-relaxed">
              {isOwner
                ? (isRTL ? 'صلاحيات المالك الكاملة مفعلة.' : 'Full Owner privileges enabled.')
                : isOwnerOrAdmin
                ? (isRTL ? 'صلاحيات إدارية ومالية معتمدة.' : 'Administrative privileges active.')
                : (isRTL ? 'صلاحيات تشغيلية محددة.' : 'Limited operational privileges.')}
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
