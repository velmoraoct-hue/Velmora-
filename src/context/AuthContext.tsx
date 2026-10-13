import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, StaffUser, PermissionKey } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../data/initialData';
import { acceptStaffInvitationIfPending } from '../services/dataService';

interface AuthContextType {
  currentUser: User | null;
  staffUser: StaffUser | null;
  staffRole: UserRole | null;
  isStaff: boolean;
  isOwner: boolean;
  isOwnerOrAdmin: boolean;
  isLoading: boolean;
  accountStatus: 'active' | 'deactivated' | 'unauthorized' | null;
  hasPermission: (permission: PermissionKey) => boolean;
  signInWithGoogle: () => Promise<void>;
  refreshStaffUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const OWNER_EMAIL = 'velmora.oct@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staffRole, setStaffRole] = useState<UserRole | null>(null);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [accountStatus, setAccountStatus] = useState<'active' | 'deactivated' | 'unauthorized' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserRole = useCallback(async (user: User) => {
    const email = user.email?.toLowerCase().trim() || '';

    // 1. Primary Owner Check (Hardened Super Admin)
    if (email === OWNER_EMAIL) {
      const ownerUser: StaffUser = {
        uid: user.uid,
        email: user.email || OWNER_EMAIL,
        displayName: user.displayName || 'Clinic Owner (د. الإدارة)',
        role: 'owner',
        permissions: ROLE_DEFAULT_PERMISSIONS['owner'],
        status: 'active'
      };
      setStaffRole('owner');
      setStaffUser(ownerUser);
      setAccountStatus('active');

      try {
        await setDoc(
          doc(db, 'staff_roles', user.uid),
          {
            email: user.email,
            role: 'owner',
            name: user.displayName || 'Clinic Owner',
            status: 'active',
            permissions: ROLE_DEFAULT_PERMISSIONS['owner'],
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Owner role recording notice:', e);
      }
      return;
    }

    // 2. Check if active staff_roles doc exists
    try {
      const roleDoc = await getDoc(doc(db, 'staff_roles', user.uid));
      if (roleDoc.exists()) {
        const data = roleDoc.data();

        if (data.status === 'deactivated') {
          setStaffRole(null);
          setStaffUser(null);
          setAccountStatus('deactivated');
          return;
        }

        const role = (data.role || 'receptionist') as UserRole;
        const perms = (data.permissions || ROLE_DEFAULT_PERMISSIONS[role] || []) as PermissionKey[];

        setStaffRole(role);
        setStaffUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || data.name || data.displayName || 'Staff Member',
          role,
          permissions: perms,
          status: 'active',
          invitedBy: data.invitedBy,
          invitedAt: data.invitedAt,
          acceptedAt: data.acceptedAt
        });
        setAccountStatus('active');
        return;
      }

      // 3. Check for pending email invitation
      const acceptedRecord = await acceptStaffInvitationIfPending(user.uid, email, user.displayName || undefined);
      if (acceptedRecord) {
        setStaffRole(acceptedRecord.role);
        setStaffUser(acceptedRecord);
        setAccountStatus('active');
        return;
      }

      // User has no staff role assigned
      setStaffRole(null);
      setStaffUser(null);
      setAccountStatus('unauthorized');
    } catch (e) {
      console.error('Error fetching user staff role:', e);
      setStaffRole(null);
      setStaffUser(null);
      setAccountStatus('unauthorized');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setCurrentUser(user);

      if (user) {
        await loadUserRole(user);
      } else {
        setStaffRole(null);
        setStaffUser(null);
        setAccountStatus(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserRole]);

  const refreshStaffUser = async () => {
    if (currentUser) {
      await loadUserRole(currentUser);
    }
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (staffRole === 'owner') return true;
    if (!staffUser || staffUser.status !== 'active') return false;
    return staffUser.permissions.includes(permission);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setStaffRole(null);
    setStaffUser(null);
    setAccountStatus(null);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const isStaff = !!staffRole && accountStatus === 'active';
  const isOwner = staffRole === 'owner';
  const isOwnerOrAdmin = (staffRole === 'owner' || staffRole === 'admin') && accountStatus === 'active';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        staffUser,
        staffRole,
        isStaff,
        isOwner,
        isOwnerOrAdmin,
        isLoading,
        accountStatus,
        hasPermission,
        signInWithGoogle,
        refreshStaffUser,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
