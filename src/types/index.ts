export type Language = 'ar' | 'en';

export type UserRole = 'owner' | 'admin' | 'receptionist' | 'practitioner';

export type ServiceCategory = 'skincare' | 'injectables' | 'peeling' | 'laser';

export type ServiceStatus = 'draft' | 'published' | 'unavailable';

export interface Service {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ServiceCategory;
  priceEgp: number;
  priceMaxEgp?: number;
  durationMinutes: number;
  status: ServiceStatus;
  requiresMedicalConsultation: boolean;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BranchCode = 'october' | 'zayed';

export interface Practitioner {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  qualificationsAr: string;
  qualificationsEn: string;
  approvedProcedures: string;
  photoUrl?: string;
  isActive: boolean;
  branch: 'october' | 'zayed' | 'both';
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  practitionerId?: string;
  practitionerName?: string;
  branch: BranchCode;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: BookingStatus;
  priceEgp: number;
  notes?: string;
  cancellationReason?: string;
  emailNotifications?: {
    customerSent?: boolean;
    adminSent?: boolean;
    sentAt?: string;
    details?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalAppointments: number;
  totalSpentEgp: number;
  lastVisitDate?: string;
  notes?: string;
  createdAt?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'instapay' | 'vodafone_cash';

export interface Transaction {
  id: string;
  bookingId?: string;
  customerName: string;
  serviceName: string;
  amountEgp: number;
  paymentMethod: PaymentMethod;
  date: string;
  recordedBy: string;
  notes?: string;
  branch?: BranchCode;
  createdAt?: string;
}

export type ExpenseCategory =
  | 'medical_supplies'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'salaries'
  | 'maintenance'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amountEgp: number;
  date: string;
  branch: 'october' | 'zayed' | 'general';
  recordedBy: string;
  createdAt?: string;
}

export type InventoryCategory =
  | 'filler'
  | 'botox'
  | 'peel'
  | 'serum'
  | 'consumable'
  | 'cleanser';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minThreshold: number;
  unit: string;
  costPerUnitEgp: number;
  batchNumber?: string;
  expiryDate?: string;
  updatedAt?: string;
}

export interface Offer {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  discountPriceEgp: number;
  originalPriceEgp: number;
  validUntil: string;
  isActive: boolean;
  servicesIncluded: string;
}

export interface BusinessSettings {
  phoneOctober: string;
  phoneZayed: string;
  whatsApp: string;
  octoberAddressAr: string;
  octoberAddressEn: string;
  zayedAddressAr: string;
  zayedAddressEn: string;
  openingHoursAr: string;
  openingHoursEn: string;
  googleMapsOctoberUrl: string;
  googleMapsZayedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  cancellationPolicyAr: string;
  cancellationPolicyEn: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  details: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  details: string;
  timestamp: string;
}

export type PermissionKey =
  | 'bookings.read'
  | 'bookings.create'
  | 'bookings.update'
  | 'customers.read'
  | 'customers.update'
  | 'services.read'
  | 'services.manage'
  | 'practitioners.read'
  | 'practitioners.manage'
  | 'staff.read'
  | 'staff.manage'
  | 'finance.read'
  | 'finance.manage'
  | 'expenses.read'
  | 'expenses.manage'
  | 'inventory.read'
  | 'inventory.manage'
  | 'offers.manage'
  | 'branding.read'
  | 'branding.manage'
  | 'content.manage'
  | 'audit.read'
  | 'settings.manage';

export type StaffAccountStatus = 'pending' | 'active' | 'deactivated';

export interface StaffUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  permissions: PermissionKey[];
  status: StaffAccountStatus;
  invitedBy?: string;
  invitedAt?: string;
  acceptedAt?: string;
  updatedAt?: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: UserRole;
  permissions: PermissionKey[];
  status: StaffAccountStatus;
  invitedByEmail: string;
  invitedAt: string;
  acceptedAt?: string;
  acceptedUid?: string;
  notes?: string;
}

export type MediaCategory =
  | 'logos'
  | 'homepage'
  | 'services'
  | 'practitioners'
  | 'gallery'
  | 'offers'
  | 'branches'
  | 'icons'
  | 'other';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  category: MediaCategory;
  altText: string;
  caption?: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  isUsedOnSite?: boolean;
}

export interface BrandConfig {
  // Identity
  brandNameAr: string;
  brandNameEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  browserTitle: string;
  footerCopyrightAr: string;
  footerCopyrightEn: string;

  // Logos
  logoPrimaryUrl: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  logoHeightPx: number;

  // Color System
  colorPageBg: string;
  colorSurfaceBg: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorTextPrimary: string;
  colorTextSecondary: string;
  colorBorder: string;
  colorBtnPrimaryBg: string;
  colorBtnPrimaryText: string;
  colorFooterBg: string;
  colorFooterText: string;

  // Approved VELMORA Palette
  colorBurgundy?: string;
  colorRoseGold?: string;
  colorChampagneGold?: string;
  colorIvory?: string;
  colorDustyMauve?: string;
  colorDarkNeutral?: string;

  // Typography
  fontArabic: string;
  fontEnglish: string;
  headingScale: 'compact' | 'classic' | 'prominent';
  bodyScale: 'small' | 'standard' | 'relaxed';

  // Components
  buttonStyle: 'flat' | 'elevated' | 'bordered';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  cardStyle: 'bordered' | 'shadowed' | 'flat';
  sectionSpacing: 'compact' | 'comfortable' | 'spacious';

  // Meta
  updatedBy: string;
  updatedAt: string;
  version?: number;
  isPublished?: boolean;
}
