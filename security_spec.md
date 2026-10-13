# VELMORA Aesthetics & Beauty - Security Specification

## 1. Data Invariants
1. **Public Services & Specialists Readability**: Unauthenticated public users can read published services and active practitioners to view the catalog. Draft/unavailable services and inactive practitioners can only be read or modified by authorized clinic staff.
2. **Strict Booking Creation Guard**: Any prospective customer can submit an appointment booking request, but:
   - Status must strictly initialize to `pending`.
   - The booking must contain valid customer name, phone number, branch, date, time slot, and published service.
   - Public users CANNOT update bookings once created, cannot modify clinic status, cannot delete bookings, and cannot list all bookings (preventing scraping customer phone numbers/names).
3. **Confidential Customer & Financial Data**: Transactions, Expenses, Customer records, Inventory, and Audit logs can ONLY be read or modified by authenticated clinic staff with appropriate role permissions (`owner`, `admin`, `receptionist`). Public unauthenticated access is completely denied.
4. **Owner Bootstrapping & Role Tampering Guard**: The owner email `velmora.oct@gmail.com` is verified. Staff roles cannot be self-elevated or modified by unauthenticated users or lower-tier roles.
5. **Double-Booking & Schedule Integrity**: Booking time slots must conform to business hours, and double-booking validations are enforced.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Payload 1 (Privilege Escalation on User Role)**: Unauthenticated write to `/staff_roles/attacker` with `{"role": "owner"}`.
2. **Payload 2 (Ghost Field Injection on Booking)**: Public booking create containing unexpected administrative field `{"status": "confirmed", "isVipDiscounted": true}`.
3. **Payload 3 (Direct Modification of Pending Status)**: Unauthenticated update to `/bookings/b123` changing `status` to `completed`.
4. **Payload 4 (Public Reading of Financial Transactions)**: Unauthenticated `get` or `list` query to `/transactions`.
5. **Payload 5 (Public Reading of Clinic Expenses)**: Unauthenticated read to `/expenses`.
6. **Payload 6 (Public Reading of Customer Directory)**: Unauthenticated read to `/customers` attempting to harvest phone numbers and treatment histories.
7. **Payload 7 (Oversized ID / Denial of Wallet Attack)**: Write attempt to `/bookings/` with a 2,000-character string ID.
8. **Payload 8 (Oversized Payload Field Attack)**: Booking creation with a customer name containing 50,000 characters.
9. **Payload 9 (Unauthorized Price Manipulation)**: Unauthenticated update to `/services/s1` setting `priceEgp` to `1`.
10. **Payload 10 (Inventory Alteration by Public)**: Unauthenticated update to `/inventory/botox` modifying `quantity` to 0.
11. **Payload 11 (Audit Log Tampering)**: Unauthenticated or non-admin deletion or alteration of `/audit_logs/log1`.
12. **Payload 12 (Unauthorized Deletion of Bookings)**: Unauthenticated delete call to `/bookings/b123`.

## 3. Test Runner
All 12 payloads are tested to assert that `PERMISSION_DENIED` is strictly enforced.
