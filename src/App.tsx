/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
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
  AuditLog
} from './types';
import {
  initializeDatabaseIfEmpty,
  getServices,
  getPractitioners,
  getBookings,
  getCustomers,
  getTransactions,
  getExpenses,
  getInventory,
  getOffers,
  getBusinessSettings,
  getAuditLogs
} from './services/dataService';
import { INITIAL_SERVICES, INITIAL_PRACTITIONERS, INITIAL_SETTINGS, INITIAL_OFFERS } from './data/initialData';

// Public Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustPillars } from './components/TrustPillars';
import { ServicesCatalog } from './components/ServicesCatalog';
import { SpecialistsSection } from './components/SpecialistsSection';
import { AboutSection } from './components/AboutSection';
import { OffersSection } from './components/OffersSection';
import { GallerySection } from './components/GallerySection';
import { ContactAndLocations } from './components/ContactAndLocations';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminServices } from './components/admin/AdminServices';
import { AdminPractitioners } from './components/admin/AdminPractitioners';
import { AdminStaffRoles } from './components/admin/AdminStaffRoles';
import { AdminMediaManager } from './components/admin/AdminMediaManager';
import { AdminBrandIdentity } from './components/admin/AdminBrandIdentity';
import { AdminOffers } from './components/admin/AdminOffers';
import { AdminExpenses } from './components/admin/AdminExpenses';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminFinancialReports } from './components/admin/AdminFinancialReports';
import { AdminContentManager } from './components/admin/AdminContentManager';
import { AdminBusinessSettings } from './components/admin/AdminBusinessSettings';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';

function MainApp() {
  const { isRTL } = useLanguage();
  const { isStaff, staffRole, isOwnerOrAdmin } = useAuth();

  // Navigation state
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>();
  const [preselectedPractitionerId, setPreselectedPractitionerId] = useState<string | undefined>();

  // Booking status quick update modal
  const [quickStatusBooking, setQuickStatusBooking] = useState<Booking | null>(null);

  // Data states
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [practitioners, setPractitioners] = useState<Practitioner[]>(INITIAL_PRACTITIONERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      // 1. Initial seed check
      await initializeDatabaseIfEmpty();

      // 2. Fetch public data
      const [svcs, docs, sets, offs] = await Promise.all([
        getServices(isStaff),
        getPractitioners(isStaff),
        getBusinessSettings(),
        getOffers(isStaff)
      ]);
      setServices(svcs);
      setPractitioners(docs);
      setSettings(sets);
      setOffers(offs);

      // 3. If staff, fetch admin records
      if (isStaff) {
        try {
          const bks = await getBookings();
          setBookings(bks);
        } catch (e) {
          console.warn('Could not load bookings:', e);
        }

        try {
          const custs = await getCustomers();
          setCustomers(custs);
        } catch (e) {
          console.warn('Could not load customers:', e);
        }

        try {
          const inv = await getInventory();
          setInventory(inv);
        } catch (e) {
          console.warn('Could not load inventory:', e);
        }

        // Financial records if authorized
        if (isOwnerOrAdmin) {
          try {
            const txs = await getTransactions();
            setTransactions(txs);
          } catch (e) {
            console.warn('Could not load transactions:', e);
          }

          try {
            const exps = await getExpenses();
            setExpenses(exps);
          } catch (e) {
            console.warn('Could not load expenses:', e);
          }

          try {
            const logs = await getAuditLogs();
            setAuditLogs(logs);
          } catch (e) {
            console.warn('Could not load audit logs:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error during data fetch:', err);
    }
  }, [isStaff, isOwnerOrAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Booking handlers
  const handleOpenBooking = (serviceId?: string) => {
    setPreselectedServiceId(serviceId);
    setPreselectedPractitionerId(undefined);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingWithDoc = (docId: string) => {
    setPreselectedPractitionerId(docId);
    setPreselectedServiceId(undefined);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingWithOffer = (offer: Offer) => {
    // Find matching service or default to first
    const matchedSvc = services.find(s => s.status === 'published');
    setPreselectedServiceId(matchedSvc?.id);
    setIsBookingModalOpen(true);
  };

  const handleNavigateSection = (id: string) => {
    if (view !== 'public') {
      setView('public');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className={`min-h-screen bg-[#FAF5F0] text-[#1F1C18] ${isRTL ? 'rtl' : 'ltr'}`}>
      
      {view === 'admin' ? (
        // ADMIN PORTAL
        !isStaff ? (
          <AdminLogin onReturnToSite={() => setView('public')} />
        ) : (
          <AdminLayout
            currentTab={adminTab}
            onTabChange={setAdminTab}
            onReturnToSite={() => setView('public')}
            pendingBookingsCount={pendingBookingsCount}
          >
            {adminTab === 'overview' && (
              <AdminDashboardOverview
                bookings={bookings}
                transactions={transactions}
                expenses={expenses}
                services={services}
                onNavigateTab={setAdminTab}
                onOpenQuickBookingStatus={(booking) => {
                  setQuickStatusBooking(booking);
                  setAdminTab('bookings');
                }}
              />
            )}

            {adminTab === 'bookings' && (
              <AdminBookings
                bookings={bookings}
                onRefresh={loadData}
                selectedBookingForStatus={quickStatusBooking}
                onClearSelectedBooking={() => setQuickStatusBooking(null)}
              />
            )}

            {adminTab === 'customers' && (
              <AdminCustomers
                customers={customers}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'services' && (
              <AdminServices
                services={services}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'practitioners' && (
              <AdminPractitioners
                practitioners={practitioners}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'staff' && (
              <AdminStaffRoles />
            )}

            {adminTab === 'media' && (
              <AdminMediaManager />
            )}

            {adminTab === 'branding' && (
              <AdminBrandIdentity />
            )}

            {adminTab === 'offers' && (
              <AdminOffers
                offers={offers}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'expenses' && (
              <AdminExpenses
                expenses={expenses}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'inventory' && (
              <AdminInventory
                inventory={inventory}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'finance' && (
              <AdminFinancialReports
                transactions={transactions}
                expenses={expenses}
                bookings={bookings}
              />
            )}

            {adminTab === 'content' && (
              <AdminContentManager />
            )}

            {adminTab === 'settings' && (
              <AdminBusinessSettings
                settings={settings}
                onRefresh={loadData}
              />
            )}

            {adminTab === 'audit' && (
              <AdminAuditLogs logs={auditLogs} />
            )}
          </AdminLayout>
        )
      ) : (
        // PUBLIC WEBSITE
        <div className="flex flex-col min-h-screen">
          <Navbar
            onOpenBooking={handleOpenBooking}
            onNavigateToSection={handleNavigateSection}
            onOpenAdmin={() => setView('admin')}
            currentView="public"
          />

          <main className="flex-1">
            <Hero
              onOpenBooking={() => handleOpenBooking()}
              onExploreServices={() => handleNavigateSection('services')}
            />

            <TrustPillars />

            <ServicesCatalog
              services={services}
              onSelectServiceForBooking={handleOpenBooking}
            />

            <SpecialistsSection
              practitioners={practitioners}
              onBookWithPractitioner={handleOpenBookingWithDoc}
            />

            <GallerySection
              onOpenBooking={() => handleOpenBooking()}
            />

            <AboutSection />

            <OffersSection
              offers={offers}
              onSelectOfferForBooking={handleOpenBookingWithOffer}
            />

            <ContactAndLocations
              settings={settings}
              onOpenBooking={() => handleOpenBooking()}
            />
          </main>

          <Footer
            settings={settings}
            onOpenBooking={() => handleOpenBooking()}
            onNavigateToSection={handleNavigateSection}
          />

          {/* Booking Modal */}
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            services={services}
            practitioners={practitioners}
            preselectedServiceId={preselectedServiceId}
            preselectedPractitionerId={preselectedPractitionerId}
          />
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrandProvider>
          <MainApp />
        </BrandProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
