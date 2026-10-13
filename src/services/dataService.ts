import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Service,
  Practitioner,
  Booking,
  Customer,
  Transaction,
  Expense,
  InventoryItem,
  Offer,
  BusinessSettings,
  AuditLog,
  BookingStatus,
  StaffUser,
  StaffInvitation,
  StaffAccountStatus,
  PermissionKey,
  UserRole,
  MediaAsset,
  MediaCategory,
  BrandConfig
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PRACTITIONERS,
  INITIAL_SETTINGS,
  INITIAL_OFFERS,
  DEFAULT_BRAND_CONFIG,
  ROLE_DEFAULT_PERMISSIONS
} from '../data/initialData';

// --- Data Seeding Helper ---
export async function initializeDatabaseIfEmpty(): Promise<void> {
  try {
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (servicesSnap.empty) {
      console.log('Seeding initial clinic services to Firestore...');
      for (const service of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', service.id), {
          ...service,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    const pracSnap = await getDocs(collection(db, 'practitioners'));
    if (pracSnap.empty) {
      console.log('Seeding initial practitioners...');
      for (const prac of INITIAL_PRACTITIONERS) {
        await setDoc(doc(db, 'practitioners', prac.id), prac);
      }
    }

    const settingsDoc = await getDoc(doc(db, 'settings', 'clinic_info'));
    if (!settingsDoc.exists()) {
      console.log('Seeding initial business settings...');
      await setDoc(doc(db, 'settings', 'clinic_info'), INITIAL_SETTINGS);
    }

    const offersSnap = await getDocs(collection(db, 'offers'));
    if (offersSnap.empty) {
      console.log('Seeding initial offers...');
      for (const offer of INITIAL_OFFERS) {
        await setDoc(doc(db, 'offers', offer.id), offer);
      }
    }
  } catch (error) {
    console.warn('Initial data seeding note:', error);
    // Silent fail if permissions prevent or already seeded
  }
}

// --- Services ---
export async function getServices(isStaff: boolean = false): Promise<Service[]> {
  const path = 'services';
  try {
    const colRef = collection(db, path);
    const q = isStaff ? query(colRef) : query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (snap.empty && !isStaff) {
      return INITIAL_SERVICES.filter(s => s.status === 'published');
    }
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
    return items.length > 0 ? items : INITIAL_SERVICES;
  } catch (error) {
    console.warn('Firestore getServices fallback to initial:', error);
    return isStaff ? INITIAL_SERVICES : INITIAL_SERVICES.filter(s => s.status === 'published');
  }
}

export async function saveService(service: Service, actorEmail: string): Promise<void> {
  const path = `services/${service.id}`;
  try {
    const docRef = doc(db, 'services', service.id);
    await setDoc(docRef, {
      ...service,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await logAuditAction('SAVE_SERVICE', actorEmail, `Updated service: ${service.nameEn} (${service.priceEgp} EGP)`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteService(serviceId: string, actorEmail: string): Promise<void> {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
    await logAuditAction('DELETE_SERVICE', actorEmail, `Deleted service ID: ${serviceId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Practitioners ---
export async function getPractitioners(isStaff: boolean = false): Promise<Practitioner[]> {
  const path = 'practitioners';
  try {
    const colRef = collection(db, path);
    const q = isStaff ? query(colRef) : query(colRef, where('isActive', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return INITIAL_PRACTITIONERS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Practitioner));
  } catch (error) {
    console.warn('Firestore getPractitioners fallback:', error);
    return INITIAL_PRACTITIONERS;
  }
}

export async function savePractitioner(practitioner: Practitioner, actorEmail: string): Promise<void> {
  const path = `practitioners/${practitioner.id}`;
  try {
    await setDoc(doc(db, 'practitioners', practitioner.id), practitioner, { merge: true });
    await logAuditAction('SAVE_PRACTITIONER', actorEmail, `Updated specialist: ${practitioner.nameEn}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Bookings ---
export async function checkSlotAvailable(
  branch: string,
  date: string,
  time: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('branch', '==', branch),
      where('appointmentDate', '==', date),
      where('appointmentTime', '==', time)
    );
    const snap = await getDocs(q);
    // Any booking that is pending or confirmed blocks the slot
    const activeBookings = snap.docs.filter(doc => {
      const status = doc.data().status;
      return status === 'pending' || status === 'confirmed';
    });
    return activeBookings.length === 0;
  } catch (error) {
    console.warn('Slot check fallback:', error);
    return true; // Don't block user if query error
  }
}

export async function createBookingRequest(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; id: string; error?: string }> {
  const path = 'bookings';
  try {
    // Check slot availability first
    const isFree = await checkSlotAvailable(
      bookingData.branch,
      bookingData.appointmentDate,
      bookingData.appointmentTime
    );

    if (!isFree) {
      return {
        success: false,
        id: '',
        error: 'SLOT_OCCUPIED'
      };
    }

    const bookingId = 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'bookings', bookingId), newBooking);

    // Trigger automated email notification (customer confirmation + admin alert)
    try {
      triggerBookingEmailNotification(newBooking);
    } catch (e) {
      console.warn('Email dispatch non-blocking notice:', e);
    }

    // Record or update customer profile
    try {
      await updateCustomerOnBooking(bookingData.customerName, bookingData.customerPhone, bookingData.customerEmail);
    } catch (e) {
      console.warn('Customer update soft-fail:', e);
    }

    return { success: true, id: bookingId };
  } catch (error) {
    console.error('Error in createBookingRequest:', error);
    // Return gracefully to display clear feedback
    return {
      success: false,
      id: '',
      error: error instanceof Error ? error.message : 'BOOKING_FAILED'
    };
  }
}

export async function triggerBookingEmailNotification(booking: Booking): Promise<any> {
  try {
    const res = await fetch('/api/bookings/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Automated notification endpoint note:', err);
  }
  return null;
}

export async function getBookings(): Promise<Booking[]> {
  const path = 'bookings';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  actorEmail: string,
  reason?: string
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    if (reason) {
      updatePayload.cancellationReason = reason;
    }
    await updateDoc(doc(db, 'bookings', bookingId), updatePayload);
    await logAuditAction('UPDATE_BOOKING_STATUS', actorEmail, `Changed booking ${bookingId} to ${newStatus}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Customers ---
async function updateCustomerOnBooking(name: string, phone: string, email?: string): Promise<void> {
  const customerId = 'cust_' + phone.replace(/[^0-9]/g, '');
  const custRef = doc(db, 'customers', customerId);
  const snap = await getDoc(custRef);
  if (snap.exists()) {
    const data = snap.data() as Customer;
    const updateData: any = {
      totalAppointments: (data.totalAppointments || 0) + 1,
      lastVisitDate: new Date().toISOString().split('T')[0]
    };
    if (email && !data.email) updateData.email = email;
    await updateDoc(custRef, updateData);
  } else {
    const newCust: Customer = {
      id: customerId,
      name,
      phone,
      email,
      totalAppointments: 1,
      totalSpentEgp: 0,
      lastVisitDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    await setDoc(custRef, newCust);
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const path = 'customers';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// --- Transactions & Revenue ---
export async function getTransactions(): Promise<Transaction[]> {
  const path = 'transactions';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    return items.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>, actorEmail: string): Promise<void> {
  const path = 'transactions';
  try {
    const id = 'TX-' + Date.now().toString(36).toUpperCase();
    await setDoc(doc(db, 'transactions', id), {
      ...tx,
      id,
      createdAt: new Date().toISOString()
    });

    // Update customer total spent
    if (tx.customerName) {
      try {
        const custSnap = await getDocs(query(collection(db, 'customers'), where('name', '==', tx.customerName)));
        if (!custSnap.empty) {
          const custDoc = custSnap.docs[0];
          const currSpent = custDoc.data().totalSpentEgp || 0;
          await updateDoc(custDoc.ref, { totalSpentEgp: currSpent + tx.amountEgp });
        }
      } catch (e) {
        console.warn('Customer totalSpent update error:', e);
      }
    }

    await logAuditAction('RECORD_TRANSACTION', actorEmail, `Recorded revenue: ${tx.amountEgp} EGP for ${tx.serviceName}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Expenses ---
export async function getExpenses(): Promise<Expense[]> {
  const path = 'expenses';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
    return items.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordExpense(expense: Omit<Expense, 'id' | 'createdAt'>, actorEmail: string): Promise<void> {
  const path = 'expenses';
  try {
    const id = 'EXP-' + Date.now().toString(36).toUpperCase();
    await setDoc(doc(db, 'expenses', id), {
      ...expense,
      id,
      createdAt: new Date().toISOString()
    });
    await logAuditAction('RECORD_EXPENSE', actorEmail, `Expense added: ${expense.amountEgp} EGP (${expense.category})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Inventory ---
export async function getInventory(): Promise<InventoryItem[]> {
  const path = 'inventory';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Return default items
      return [
        { id: 'inv-1', name: 'Hyaluronic Acid Filler 1ml (Swiss)', category: 'filler', quantity: 18, minThreshold: 5, unit: 'Seringe', costPerUnitEgp: 2200 },
        { id: 'inv-2', name: 'Botulinum Toxin Type A 100U', category: 'botox', quantity: 12, minThreshold: 4, unit: 'Vial', costPerUnitEgp: 1800 },
        { id: 'inv-3', name: 'Dermapen Sterile Needle Cartridges (16-pin)', category: 'consumable', quantity: 45, minThreshold: 20, unit: 'Piece', costPerUnitEgp: 65 },
        { id: 'inv-4', name: 'Cosmelan 2 Depigmenting Cream 30g', category: 'peel', quantity: 8, minThreshold: 3, unit: 'Jar', costPerUnitEgp: 950 },
        { id: 'inv-5', name: 'Exosome Lyophilized Powder + Solvent', category: 'serum', quantity: 10, minThreshold: 3, unit: 'Kit', costPerUnitEgp: 1600 }
      ];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveInventoryItem(item: InventoryItem, actorEmail: string): Promise<void> {
  const path = `inventory/${item.id}`;
  try {
    await setDoc(doc(db, 'inventory', item.id), {
      ...item,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await logAuditAction('SAVE_INVENTORY', actorEmail, `Updated inventory: ${item.name} (Qty: ${item.quantity})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Offers ---
export async function getOffers(isStaff: boolean = false): Promise<Offer[]> {
  const path = 'offers';
  try {
    const colRef = collection(db, path);
    const q = isStaff ? query(colRef) : query(colRef, where('isActive', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return INITIAL_OFFERS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Offer));
  } catch (error) {
    console.warn('Offers query fallback:', error);
    return INITIAL_OFFERS;
  }
}

export async function saveOffer(offer: Offer, actorEmail: string): Promise<void> {
  const path = `offers/${offer.id}`;
  try {
    await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
    await logAuditAction('SAVE_OFFER', actorEmail, `Updated offer: ${offer.titleEn}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Settings ---
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const path = 'settings/clinic_info';
  try {
    const snap = await getDoc(doc(db, 'settings', 'clinic_info'));
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.warn('Settings get fallback:', error);
    return INITIAL_SETTINGS;
  }
}

export async function saveBusinessSettings(settings: BusinessSettings, actorEmail: string): Promise<void> {
  const path = 'settings/clinic_info';
  try {
    await setDoc(doc(db, 'settings', 'clinic_info'), settings, { merge: true });
    await logAuditAction('UPDATE_SETTINGS', actorEmail, 'Updated clinic contact and policy settings');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Audit Logs ---
export async function logAuditAction(action: string, actorEmail: string, details: string): Promise<void> {
  try {
    const logId = 'LOG-' + Date.now().toString(36).toUpperCase();
    const log: AuditLog = {
      id: logId,
      action,
      actorEmail: actorEmail || 'system',
      details,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'audit_logs', logId), log);
  } catch (e) {
    console.warn('Audit logging note:', e);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'audit_logs';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// --- STAFF & ROLE-BASED ACCESS CONTROL ---
// ==========================================

export async function getStaffUsers(): Promise<StaffUser[]> {
  const path = 'staff_roles';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => {
      const data = d.data();
      const role = (data.role || 'receptionist') as UserRole;
      return {
        uid: d.id,
        email: data.email || '',
        displayName: data.displayName || data.name || data.email,
        role,
        permissions: (data.permissions || ROLE_DEFAULT_PERMISSIONS[role] || []) as PermissionKey[],
        status: (data.status || 'active') as StaffAccountStatus,
        invitedBy: data.invitedBy,
        invitedAt: data.invitedAt,
        acceptedAt: data.acceptedAt,
        updatedAt: data.updatedAt
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getStaffInvitations(): Promise<StaffInvitation[]> {
  const path = 'staff_invitations';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffInvitation));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createStaffInvitation(
  email: string,
  role: UserRole,
  permissions: PermissionKey[],
  actorEmail: string,
  notes?: string
): Promise<StaffInvitation> {
  const cleanEmail = email.trim().toLowerCase();
  const invitationId = 'inv_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
  const path = `staff_invitations/${invitationId}`;

  // Exclusive owner check: No one can invite another owner unless actor is primary owner
  if (role === 'owner' && actorEmail !== 'velmora.oct@gmail.com') {
    throw new Error('Exclusive ownership: Only the primary owner can assign Owner privileges.');
  }

  const invitation: StaffInvitation = {
    id: invitationId,
    email: cleanEmail,
    role,
    permissions: permissions.length > 0 ? permissions : ROLE_DEFAULT_PERMISSIONS[role],
    status: 'pending',
    invitedByEmail: actorEmail,
    invitedAt: new Date().toISOString(),
    notes
  };

  try {
    await setDoc(doc(db, 'staff_invitations', invitationId), invitation);
    await logAuditAction(
      'INVITE_STAFF',
      actorEmail,
      `Created staff invitation for ${cleanEmail} with role: ${role.toUpperCase()}`
    );
    return invitation;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateStaffPermissions(
  uid: string,
  role: UserRole,
  permissions: PermissionKey[],
  actorEmail: string
): Promise<void> {
  const path = `staff_roles/${uid}`;

  // Prevent demoting primary owner
  if (uid === 'velmora.oct@gmail.com' || uid.includes('velmora.oct')) {
    if (role !== 'owner') {
      throw new Error('Cannot change the role of the primary clinic owner.');
    }
  }

  try {
    await updateDoc(doc(db, 'staff_roles', uid), {
      role,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail
    });

    await logAuditAction(
      'UPDATE_PERMISSIONS',
      actorEmail,
      `Updated permissions and role (${role.toUpperCase()}) for UID: ${uid}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleStaffStatus(
  uid: string,
  newStatus: StaffAccountStatus,
  actorEmail: string
): Promise<void> {
  const path = `staff_roles/${uid}`;

  if (uid === 'velmora.oct@gmail.com' || uid.includes('velmora.oct')) {
    throw new Error('The primary clinic owner account cannot be deactivated.');
  }

  try {
    await updateDoc(doc(db, 'staff_roles', uid), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail
    });

    await logAuditAction(
      'TOGGLE_STAFF_STATUS',
      actorEmail,
      `Changed staff UID ${uid} status to: ${newStatus.toUpperCase()}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function revokeStaffAccess(uid: string, actorEmail: string): Promise<void> {
  const path = `staff_roles/${uid}`;

  if (uid === 'velmora.oct@gmail.com' || uid.includes('velmora.oct')) {
    throw new Error('The primary clinic owner account cannot be revoked.');
  }

  try {
    await deleteDoc(doc(db, 'staff_roles', uid));
    await logAuditAction(
      'REVOKE_STAFF_ACCESS',
      actorEmail,
      `Revoked and deleted staff access credentials for UID: ${uid}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteStaffInvitation(invitationId: string, actorEmail: string): Promise<void> {
  const path = `staff_invitations/${invitationId}`;
  try {
    await deleteDoc(doc(db, 'staff_invitations', invitationId));
    await logAuditAction('DELETE_INVITATION', actorEmail, `Deleted invitation: ${invitationId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * When an invited user signs in with Google, verify their email against pending invitations
 * and transition from invitation-pending to active staff with their real Firebase UID.
 */
export async function acceptStaffInvitationIfPending(
  uid: string,
  email: string,
  displayName?: string
): Promise<StaffUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const invitationId = 'inv_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
  
  try {
    const invRef = doc(db, 'staff_invitations', invitationId);
    const invSnap = await getDoc(invRef);

    if (invSnap.exists()) {
      const invData = invSnap.data() as StaffInvitation;

      if (invData.status === 'pending') {
        const staffRecord: StaffUser = {
          uid,
          email: cleanEmail,
          displayName: displayName || cleanEmail,
          role: invData.role,
          permissions: invData.permissions || ROLE_DEFAULT_PERMISSIONS[invData.role],
          status: 'active',
          invitedBy: invData.invitedByEmail,
          invitedAt: invData.invitedAt,
          acceptedAt: new Date().toISOString()
        };

        // Create active staff role doc mapped by authenticated UID
        await setDoc(doc(db, 'staff_roles', uid), {
          ...staffRecord,
          name: displayName || cleanEmail
        });

        // Mark invitation accepted
        await updateDoc(invRef, {
          status: 'active',
          acceptedUid: uid,
          acceptedAt: new Date().toISOString()
        });

        await logAuditAction(
          'ACCEPT_STAFF_INVITATION',
          cleanEmail,
          `User accepted invitation and linked authenticated UID (${uid}) as ${invData.role.toUpperCase()}`
        );

        return staffRecord;
      }
    }
  } catch (err) {
    console.warn('Check pending invitation note:', err);
  }

  return null;
}

// ==========================================
// --- MEDIA MANAGER & ASSETS ---
// ==========================================

export async function getMediaAssets(category?: MediaCategory): Promise<MediaAsset[]> {
  const path = 'media_assets';
  try {
    const colRef = collection(db, path);
    const q = category
      ? query(colRef, where('category', '==', category))
      : query(colRef);
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaAsset));
    return items.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveMediaAsset(asset: MediaAsset, actorEmail: string): Promise<void> {
  const path = `media_assets/${asset.id}`;
  try {
    await setDoc(doc(db, 'media_assets', asset.id), asset, { merge: true });
    await logAuditAction('SAVE_MEDIA_ASSET', actorEmail, `Updated media asset: ${asset.name} (${asset.category})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMediaAsset(assetId: string, storagePath: string, actorEmail: string): Promise<void> {
  const path = `media_assets/${assetId}`;
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'media_assets', assetId));

    // Delete from Firebase Storage if configured
    if (storage && storagePath) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Storage delete non-blocking notice:', err);
      }
    }

    await logAuditAction('DELETE_MEDIA_ASSET', actorEmail, `Deleted media asset ID: ${assetId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Optimizes an image client-side via HTML5 Canvas (auto-resizing & WebP compression)
 */
export async function optimizeImageClientSide(
  file: File,
  maxWidth: number = 1600,
  quality: number = 0.85
): Promise<{ blob: Blob; width: number; height: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            const dataUrl = canvas.toDataURL(mime, quality);
            resolve({ blob, width, height, dataUrl });
          },
          mime,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads media asset with progress tracking, storage upload and Firestore metadata registration
 */
export async function uploadMediaFile(
  file: File,
  category: MediaCategory,
  altText: string,
  actorEmail: string,
  caption?: string,
  onProgress?: (percent: number) => void
): Promise<MediaAsset> {
  const assetId = 'med_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `media/${category}/${assetId}_${cleanName}`;

  onProgress?.(10);

  // 1. Optimize client-side
  let width = 0;
  let height = 0;
  let finalBlob: Blob = file;
  let localDataUrl = '';

  try {
    const opt = await optimizeImageClientSide(file);
    finalBlob = opt.blob;
    width = opt.width;
    height = opt.height;
    localDataUrl = opt.dataUrl;
  } catch (err) {
    console.warn('Image optimization skipped, using raw file:', err);
  }

  onProgress?.(40);

  let downloadUrl = localDataUrl;

  // 2. Upload to Firebase Storage if available
  if (storage) {
    try {
      const fileRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(fileRef, finalBlob, {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          category,
          uploadedBy: actorEmail,
          altText
        }
      });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 50) + 40;
            onProgress?.(pct);
          },
          (error) => {
            console.warn('Storage upload error, falling back to optimized inline asset:', error);
            resolve(); // Don't throw, fallback to data URL
          },
          async () => {
            try {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            } catch (e) {
              resolve();
            }
          }
        );
      });
    } catch (e) {
      console.warn('Firebase Storage upload exception, using local optimized asset:', e);
    }
  }

  onProgress?.(95);

  // 3. Register asset in Firestore
  const newAsset: MediaAsset = {
    id: assetId,
    name: file.name,
    url: downloadUrl || localDataUrl,
    storagePath,
    category,
    altText: altText || file.name,
    caption: caption || '',
    width: width || undefined,
    height: height || undefined,
    sizeBytes: finalBlob.size || file.size,
    mimeType: file.type || 'image/jpeg',
    uploadedBy: actorEmail,
    uploadedAt: new Date().toISOString(),
    isUsedOnSite: false
  };

  await setDoc(doc(db, 'media_assets', assetId), newAsset);
  await logAuditAction('UPLOAD_MEDIA', actorEmail, `Uploaded media: ${file.name} to ${category}`);

  onProgress?.(100);
  return newAsset;
}

// ==========================================
// --- BRAND IDENTITY & DESIGN TOKENS ---
// ==========================================

export async function getPublishedBrandConfig(): Promise<BrandConfig> {
  const path = 'branding/published_config';
  try {
    const snap = await getDoc(doc(db, 'branding', 'published_config'));
    if (snap.exists()) {
      return snap.data() as BrandConfig;
    }
    return DEFAULT_BRAND_CONFIG;
  } catch (error) {
    console.warn('Published branding get fallback:', error);
    return DEFAULT_BRAND_CONFIG;
  }
}

export async function getDraftBrandConfig(): Promise<BrandConfig> {
  const path = 'branding/draft_config';
  try {
    const snap = await getDoc(doc(db, 'branding', 'draft_config'));
    if (snap.exists()) {
      return snap.data() as BrandConfig;
    }
    return await getPublishedBrandConfig();
  } catch (error) {
    console.warn('Draft branding get fallback:', error);
    return DEFAULT_BRAND_CONFIG;
  }
}

export async function saveDraftBrandConfig(config: BrandConfig, actorEmail: string): Promise<void> {
  const path = 'branding/draft_config';
  try {
    const payload: BrandConfig = {
      ...config,
      updatedBy: actorEmail,
      updatedAt: new Date().toISOString(),
      isPublished: false
    };
    await setDoc(doc(db, 'branding', 'draft_config'), payload, { merge: true });
    await logAuditAction('SAVE_BRAND_DRAFT', actorEmail, 'Saved brand identity draft');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function publishBrandConfig(config: BrandConfig, actorEmail: string): Promise<void> {
  const path = 'branding/published_config';
  try {
    const payload: BrandConfig = {
      ...config,
      updatedBy: actorEmail,
      updatedAt: new Date().toISOString(),
      isPublished: true,
      version: (config.version || 1) + 1
    };
    // Save to published and sync draft
    await setDoc(doc(db, 'branding', 'published_config'), payload);
    await setDoc(doc(db, 'branding', 'draft_config'), payload);

    await logAuditAction(
      'PUBLISH_BRANDING',
      actorEmail,
      `Published new brand identity version ${payload.version}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function restoreBrandDefaults(actorEmail: string): Promise<BrandConfig> {
  const path = 'branding/published_config';
  try {
    const resetConfig: BrandConfig = {
      ...DEFAULT_BRAND_CONFIG,
      updatedBy: actorEmail,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'branding', 'published_config'), resetConfig);
    await setDoc(doc(db, 'branding', 'draft_config'), resetConfig);

    await logAuditAction('RESET_BRAND_DEFAULTS', actorEmail, 'Restored default VELMORA branding');
    return resetConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
