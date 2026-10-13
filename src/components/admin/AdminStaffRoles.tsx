import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  StaffUser,
  StaffInvitation,
  UserRole,
  PermissionKey,
  StaffAccountStatus
} from '../../types';
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../data/initialData';
import {
  getStaffUsers,
  getStaffInvitations,
  createStaffInvitation,
  updateStaffPermissions,
  toggleStaffStatus,
  revokeStaffAccess,
  deleteStaffInvitation
} from '../../services/dataService';
import {
  UserCheck,
  Shield,
  UserPlus,
  Mail,
  Check,
  X,
  AlertCircle,
  Search,
  RefreshCw,
  Power,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminStaffRoles: React.FC = () => {
  const { isRTL } = useLanguage();
  const { staffRole, staffUser, isOwner, hasPermission } = useAuth();

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'matrix'>('members');

  // Invitation Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('receptionist');
  const [invitePermissions, setInvitePermissions] = useState<PermissionKey[]>(
    ROLE_DEFAULT_PERMISSIONS['receptionist']
  );
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviting, setInviting] = useState(false);

  // Edit Permissions Modal
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('receptionist');
  const [editPermissions, setEditPermissions] = useState<PermissionKey[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Confirmation state
  const [confirmRevokeUid, setConfirmRevokeUid] = useState<string | null>(null);

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canManageStaff = isOwner || hasPermission('staff.manage');

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [members, invites] = await Promise.all([
        getStaffUsers(),
        getStaffInvitations()
      ]);
      setStaffList(members || []);
      setInvitations(invites || []);
    } catch (e: any) {
      console.error('Error loading staff:', e);
      showToast('error', isRTL ? 'تعذر تحميل بيانات الموظفين' : 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleSelectForInvite = (role: UserRole) => {
    setInviteRole(role);
    setInvitePermissions(ROLE_DEFAULT_PERMISSIONS[role] || []);
  };

  const toggleInvitePermission = (key: PermissionKey) => {
    setInvitePermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleEditPermission = (key: PermissionKey) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      showToast('error', isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please provide a valid email');
      return;
    }

    if (inviteRole === 'owner' && !isOwner) {
      showToast('error', isRTL ? 'امتيازات المالك حصرية للمالك الحالي فقط' : 'Owner role is exclusive');
      return;
    }

    setInviting(true);
    try {
      await createStaffInvitation(
        inviteEmail,
        inviteRole,
        invitePermissions,
        staffUser?.email || 'admin',
        inviteNotes
      );
      showToast(
        'success',
        isRTL
          ? `تم إنشاء دعوة الانضمام لـ ${inviteEmail} بنجاح. سيتم تفعيل الحساب بمجرد تسجيل دخوله عبر Google.`
          : `Invitation created for ${inviteEmail}. Account activates upon Google sign-in.`
      );
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteNotes('');
      loadData();
    } catch (err: any) {
      console.error('Invite error:', err);
      showToast('error', err.message || (isRTL ? 'فشل إنشاء الدعوة' : 'Failed to create invitation'));
    } finally {
      setInviting(false);
    }
  };

  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setEditRole(staff.role);
    setEditPermissions(staff.permissions || ROLE_DEFAULT_PERMISSIONS[staff.role] || []);
  };

  const handleSavePermissions = async () => {
    if (!editingStaff) return;
    setSavingEdit(true);
    try {
      await updateStaffPermissions(
        editingStaff.uid,
        editRole,
        editPermissions,
        staffUser?.email || 'admin'
      );
      showToast('success', isRTL ? 'تم حفظ الصلاحيات المحدثة' : 'Permissions updated successfully');
      setEditingStaff(null);
      loadData();
    } catch (err: any) {
      console.error('Save permissions error:', err);
      showToast('error', err.message || (isRTL ? 'فشل تحديث الصلاحيات' : 'Failed to update permissions'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (staff: StaffUser) => {
    const newStatus: StaffAccountStatus = staff.status === 'active' ? 'deactivated' : 'active';
    try {
      await toggleStaffStatus(staff.uid, newStatus, staffUser?.email || 'admin');
      showToast(
        'success',
        newStatus === 'active'
          ? (isRTL ? 'تم تنشيط الحساب بنجاح' : 'Account activated')
          : (isRTL ? 'تم تعطيل الحساب ومنع الوصول' : 'Account deactivated')
      );
      loadData();
    } catch (err: any) {
      console.error('Status toggle error:', err);
      showToast('error', err.message || (isRTL ? 'فشل تغيير حالة الحساب' : 'Failed to toggle status'));
    }
  };

  const handleRevokeStaff = async (uid: string) => {
    try {
      await revokeStaffAccess(uid, staffUser?.email || 'admin');
      showToast('success', isRTL ? 'تم سحب الصلاحيات وحذف بيانات الحساب' : 'Staff access revoked');
      setConfirmRevokeUid(null);
      loadData();
    } catch (err: any) {
      console.error('Revoke error:', err);
      showToast('error', err.message || (isRTL ? 'فشل سحب الصلاحيات' : 'Failed to revoke access'));
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteStaffInvitation(inviteId, staffUser?.email || 'admin');
      showToast('success', isRTL ? 'تم إلغاء الدعوة' : 'Invitation deleted');
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting invitation');
    }
  };

  // Filter staff by search query
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.email?.toLowerCase().includes(q) ||
      s.displayName?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-start">
      {/* Toast alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18] flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#C5A265]" />
            <span>{isRTL ? 'إدارة الموظفين ونظام الصلاحيات المتقدم' : 'Staff & Granular RBAC Permissions'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            {isRTL
              ? 'إدارة دعوات الكادر وتخصيص صلاحيات الوصول إلى السجلات السريرية والمالية بدقة'
              : 'Manage invitations, active credentials, and fine-grained permissions per role'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-lg border border-[#DECDB8] bg-white text-[#4A4337] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManageStaff && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#C5A265]" />
              <span>{isRTL ? 'دعوة موظف جديد' : 'Invite Staff Member'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-[#DECDB8] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-[#1F1C18] text-[#FAF7F2]'
              : 'text-[#645C4E] hover:text-[#1F1C18] hover:bg-[#F3ECE2]'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'الموظفون النشطون' : 'Active Staff'}</span>
          <span className="bg-[#FAF7F2]/20 px-1.5 py-0.5 rounded text-[11px]">{staffList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'bg-[#1F1C18] text-[#FAF7F2]'
              : 'text-[#645C4E] hover:text-[#1F1C18] hover:bg-[#F3ECE2]'
          }`}
        >
          <Mail className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'الدعوات المعلقة' : 'Pending Invitations'}</span>
          {invitations.filter((i) => i.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
              {invitations.filter((i) => i.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'bg-[#1F1C18] text-[#FAF7F2]'
              : 'text-[#645C4E] hover:text-[#1F1C18] hover:bg-[#F3ECE2]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'مصفوفة الصلاحيات (23 صلاحية)' : 'Role Matrix'}</span>
        </button>
      </div>

      {/* Search Bar for Members */}
      {activeTab === 'members' && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A714C] absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRTL
                ? 'البحث بالبريد الإلكتروني، الاسم، أو الدور الوظيفي...'
                : 'Search by email, name, or role...'
            }
            className="w-full pr-10 pl-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl bg-white border border-[#DECDB8] text-xs sm:text-sm text-[#1F1C18] placeholder-[#9E9484] focus:outline-none focus:ring-1 focus:ring-[#C5A265]"
          />
        </div>
      )}

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-[#736B5E] text-xs sm:text-sm flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C5A265]" />
              <span>{isRTL ? 'جارٍ تحميل قائمة الموظفين...' : 'Loading staff directory...'}</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#DECDB8] text-[#736B5E] text-xs sm:text-sm">
              {isRTL ? 'لا يوجد موظفون يطابقون البحث.' : 'No staff members match your search.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => {
                const isPrimaryOwner = staff.email === 'velmora.oct@gmail.com';
                const isDeactivated = staff.status === 'deactivated';

                return (
                  <div
                    key={staff.uid}
                    className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                      isDeactivated
                        ? 'border-rose-200 bg-rose-50/20 opacity-75'
                        : 'border-[#DECDB8] hover:border-[#C5A265]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-sm text-[#1F1C18] flex items-center gap-1.5">
                            <span>{staff.displayName || staff.email}</span>
                            {isPrimaryOwner && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                PRIMARY OWNER
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-[#736B5E] font-mono select-all">{staff.email}</p>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            staff.role === 'owner'
                              ? 'bg-[#1F1C18] text-[#FAF7F2]'
                              : staff.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDeactivated ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-[#645C4E]">
                          {isDeactivated
                            ? isRTL
                              ? 'معطل (ممنوع من الدخول)'
                              : 'Deactivated (Access Revoked)'
                            : isRTL
                            ? 'نشط ومعتمد'
                            : 'Active & Authorized'}
                        </span>
                      </div>

                      {/* Permissions preview count */}
                      <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D1] text-[11px] text-[#5D5548] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#C5A265]" />
                          <span>{isRTL ? 'عدد الصلاحيات الممنوحة:' : 'Granted Permissions:'}</span>
                        </span>
                        <span className="font-mono font-bold text-[#1F1C18]">
                          {isPrimaryOwner ? 'All (23)' : staff.permissions?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    {canManageStaff && !isPrimaryOwner && (
                      <div className="pt-3 border-t border-[#F0E6D8] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#4A4337] hover:text-[#1F1C18] bg-[#F3ECE2] hover:bg-[#EAE0D1] rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8A714C]" />
                          <span>{isRTL ? 'تعديل الصلاحيات' : 'Edit Permissions'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isDeactivated
                                ? 'text-emerald-700 hover:bg-emerald-100'
                                : 'text-amber-700 hover:bg-amber-100'
                            }`}
                            title={isDeactivated ? 'Activate' : 'Deactivate'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmRevokeUid(staff.uid)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                            title="Revoke and delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            {isRTL
              ? 'ملاحظة أمنية: إنشاء الدعوة لا يمنح أي وصول تلقائي بمجرد حفظ البريد. يلزم الموظف تسجيل الدخول عبر Google باستخدام نفس البريد للتحقق من هوية UID وربطه بالصلاحيات.'
              : 'Security Invariant: Adding an invitation does NOT grant access by email alone. The user must authenticate via Google to bind their verified UID and accept access.'}
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#DECDB8] text-[#736B5E] text-xs sm:text-sm">
              {isRTL ? 'لا توجد دعوات مسجلة حالياً.' : 'No pending invitations.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#DECDB8] bg-white">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F8F5EF] border-b border-[#DECDB8] text-[#5D5548]">
                  <tr>
                    <th className="py-3 px-4">{isRTL ? 'البريد المدعو' : 'Invited Email'}</th>
                    <th className="py-3 px-4">{isRTL ? 'الدور المخصص' : 'Role'}</th>
                    <th className="py-3 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4">{isRTL ? 'المرسل' : 'Invited By'}</th>
                    <th className="py-3 px-4">{isRTL ? 'تاريخ الدعوة' : 'Date'}</th>
                    <th className="py-3 px-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#1F1C18]">{inv.email}</td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-[11px] font-bold text-[#8A714C]">{inv.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.status === 'pending' ? (isRTL ? 'بانتظار تسجيل الدخول' : 'Pending Sign-in') : inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#736B5E]">{inv.invitedByEmail}</td>
                      <td className="py-3 px-4 text-[#736B5E]" dir="ltr">
                        {inv.invitedAt?.split('T')[0] || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {canManageStaff && (
                          <button
                            onClick={() => handleDeleteInvite(inv.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Cancel invitation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F3ECE2] border-b border-[#DECDB8]">
            <h3 className="font-serif text-base font-semibold text-[#1F1C18]">
              {isRTL ? 'مصفوفة الصلاحيات المعتمدة لمركز ڤيلمورا' : 'Full Permissions Specification Matrix'}
            </h3>
            <p className="text-xs text-[#736B5E] mt-0.5">
              {isRTL
                ? 'تفصيل الصلاحيات الـ 23 الصريحة وتوزيعها الافتراضي على الأدوار الوظيفية'
                : '23 explicit granular permissions enforced by Firestore security rules'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#FAF7F2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-3 px-4">{isRTL ? 'رمز الصلاحية / المفتاح' : 'Permission Key'}</th>
                  <th className="py-3 px-4">{isRTL ? 'الوصف بالعربية' : 'Description'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'المالك' : 'Owner'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'المدير' : 'Admin'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'الاستقبال' : 'Receptionist'}</th>
                  <th className="py-3 px-4 text-center">{isRTL ? 'الممارس' : 'Practitioner'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {ALL_PERMISSIONS.map((p) => {
                  const hasOwner = ROLE_DEFAULT_PERMISSIONS.owner.includes(p.key);
                  const hasAdmin = ROLE_DEFAULT_PERMISSIONS.admin.includes(p.key);
                  const hasRecep = ROLE_DEFAULT_PERMISSIONS.receptionist.includes(p.key);
                  const hasPrac = ROLE_DEFAULT_PERMISSIONS.practitioner.includes(p.key);

                  return (
                    <tr key={p.key} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#8A714C]">{p.key}</td>
                      <td className="py-3 px-4 text-[#1F1C18]">
                        {isRTL ? p.labelAr : p.labelEn}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasOwner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasRecep ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasPrac ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-300 mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: INVITE STAFF */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-[#FAF7F2] rounded-2xl border border-[#DECDB8] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
              <div className="space-y-1">
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1F1C18] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#C5A265]" />
                  <span>{isRTL ? 'إرسال دعوة انضمام موظف جديد' : 'Invite Staff Member'}</span>
                </h3>
                <p className="text-xs text-[#736B5E]">
                  {isRTL
                    ? 'حدد البريد الإلكتروني والدور لتخصيص الصلاحيات المناسبة'
                    : 'Assign a predefined role and customize granular permissions'}
                </p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4337] block">
                  {isRTL ? 'البريد الإلكتروني لحساب Google للموظف:' : 'Staff Google Account Email:'}
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. specialist@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DECDB8] text-xs sm:text-sm text-[#1F1C18] focus:outline-none focus:ring-1 focus:ring-[#C5A265]"
                />
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4337] block">
                  {isRTL ? 'الدور الوظيفي الرئيسي:' : 'Assigned Role:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['owner', 'admin', 'receptionist', 'practitioner'] as UserRole[]).map((r) => {
                    const isSelected = inviteRole === r;
                    const isOwnerDisabled = r === 'owner' && !isOwner;

                    return (
                      <button
                        type="button"
                        key={r}
                        disabled={isOwnerDisabled}
                        onClick={() => handleRoleSelectForInvite(r)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1C18] text-[#FAF7F2] border-[#1F1C18]'
                            : 'bg-white text-[#4A4337] border-[#DECDB8] hover:bg-[#F3ECE2]'
                        } ${isOwnerDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className="uppercase text-xs font-bold block">{r}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {r === 'owner'
                            ? (isRTL ? 'مالك' : 'Owner')
                            : r === 'admin'
                            ? (isRTL ? 'مدير' : 'Admin')
                            : r === 'receptionist'
                            ? (isRTL ? 'استقبال' : 'Reception')
                            : (isRTL ? 'طبيب' : 'Doctor')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular permissions checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الصلاحيات الفردية المخصصة:' : 'Configured Permissions:'}
                  </label>
                  <span className="text-[11px] text-[#8A714C] font-mono">
                    {invitePermissions.length} / {ALL_PERMISSIONS.length}
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto p-3 bg-white rounded-xl border border-[#DECDB8] divide-y divide-[#F5EFE6]">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = invitePermissions.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className="py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#FAF7F2] px-2 rounded"
                      >
                        <div className="space-y-0.5 text-start">
                          <span className="font-medium text-[#1F1C18] block">
                            {isRTL ? p.labelAr : p.labelEn}
                          </span>
                          <span className="font-mono text-[10px] text-[#9A8F7F]">{p.key}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInvitePermission(p.key)}
                          className="w-4 h-4 text-[#C5A265] rounded border-gray-300 focus:ring-[#C5A265] cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4337] block">
                  {isRTL ? 'ملاحظات إدارية داخلية (اختياري):' : 'Internal Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="e.g. Branch Sheikh Zayed Receptionist"
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#DECDB8] text-xs text-[#1F1C18]"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[#E8DEC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#4A4337] hover:bg-[#F3ECE2] cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-2.5 rounded-lg bg-[#1F1C18] text-[#FAF7F2] text-xs sm:text-sm font-medium hover:bg-[#342E25] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {inviting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRTL ? 'تأكيد وإصدار الدعوة' : 'Send Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACTIVE PERMISSIONS */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-[#FAF7F2] rounded-2xl border border-[#DECDB8] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
              <div className="space-y-1">
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1F1C18] flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#C5A265]" />
                  <span>{isRTL ? 'تعديل صلاحيات الموظف' : 'Edit Staff Permissions'}</span>
                </h3>
                <p className="text-xs text-[#736B5E] font-mono">{editingStaff.email}</p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4337] block">
                  {isRTL ? 'الدور الوظيفي:' : 'Role:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['owner', 'admin', 'receptionist', 'practitioner'] as UserRole[]).map((r) => {
                    const isSelected = editRole === r;
                    const isOwnerDisabled = r === 'owner' && !isOwner;

                    return (
                      <button
                        type="button"
                        key={r}
                        disabled={isOwnerDisabled}
                        onClick={() => {
                          setEditRole(r);
                          setEditPermissions(ROLE_DEFAULT_PERMISSIONS[r]);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1C18] text-[#FAF7F2] border-[#1F1C18]'
                            : 'bg-white text-[#4A4337] border-[#DECDB8]'
                        } ${isOwnerDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className="uppercase text-xs font-bold block">{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permissions list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4A4337]">
                    {isRTL ? 'الصلاحيات الممنوحة:' : 'Individual Permissions:'}
                  </label>
                  <span className="text-[11px] text-[#8A714C] font-mono">
                    {editPermissions.length} / {ALL_PERMISSIONS.length}
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto p-3 bg-white rounded-xl border border-[#DECDB8] divide-y divide-[#F5EFE6]">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = editPermissions.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className="py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#FAF7F2] px-2 rounded"
                      >
                        <div className="space-y-0.5 text-start">
                          <span className="font-medium text-[#1F1C18] block">
                            {isRTL ? p.labelAr : p.labelEn}
                          </span>
                          <span className="font-mono text-[10px] text-[#9A8F7F]">{p.key}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEditPermission(p.key)}
                          className="w-4 h-4 text-[#C5A265] rounded border-gray-300 focus:ring-[#C5A265] cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E8DEC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#4A4337] hover:bg-[#F3ECE2]"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSavePermissions}
                  className="px-6 py-2.5 rounded-lg bg-[#1F1C18] text-[#FAF7F2] text-xs sm:text-sm font-medium hover:bg-[#342E25] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRTL ? 'حفظ الصلاحيات' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REVOCATION DIALOG */}
      {confirmRevokeUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-2xl border border-rose-300 p-6 space-y-4 text-start shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-serif text-lg font-semibold text-[#1F1C18]">
                {isRTL ? 'تأكيد سحب الصلاحيات الإدارية' : 'Confirm Access Revocation'}
              </h4>
            </div>
            <p className="text-xs text-[#645C4E] leading-relaxed">
              {isRTL
                ? 'هل أنت متأكد من سحب صلاحيات هذا الموظف بالكامل؟ سيتم حذف بيانات الوصول الخاصة به فوراً ولن يتمكن من الدخول إلى لوحة التحكم.'
                : 'Are you sure you want to revoke and delete all administrative access for this user? This action is immediate and recorded in the audit log.'}
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmRevokeUid(null)}
                className="px-4 py-2 text-xs text-[#4A4337] rounded-lg border border-[#DECDB8] hover:bg-[#F3ECE2] cursor-pointer"
              >
                {isRTL ? 'تراجع' : 'Cancel'}
              </button>
              <button
                onClick={() => handleRevokeStaff(confirmRevokeUid)}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
              >
                {isRTL ? 'نعم، سحب الصلاحيات' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
