# 🛡️ Campus Lost & Found Portal - Supabase Integration & Secure Data Lifecycle

This document provides the complete architecture, setup instructions, security model, and data retention guidelines for the Supabase PostgreSQL backend integration.

---

## 1. 🏗️ Database Architecture & ER Model

The PostgreSQL schema is structured across dedicated, normalized tables with UUID primary keys and strict Row Level Security (RLS).

### Tables Summary

| Table | Purpose | Security / Privacy Level |
| :--- | :--- | :--- |
| `public.profiles` | User profiles linked to `auth.users(id)` with college roll numbers, departments, and roles. | Restricted. Self-update only. Full view for Admins & Security. |
| `public.lost_items` | Student-reported lost item registry with location, category, timestamp, and AI embedding vector. | Public metadata. Temporary contact & secret identifiers purged upon return. |
| `public.found_items` | Campus-wide found items registry with storage locker locations and custody history. | Public metadata. Temporary finder notes purged upon return. |
| `public.items` | Unified compatibility table for client synchronization and real-time streams. | Public metadata with privacy-sanitized completed cases. |
| `public.claims` | Ownership verification claims containing secret answers and proof files. | **Strictly Private**. Accessible only by claimant and Campus Security. |
| `public.item_matches`| AI-driven matching scores and reason metadata linking lost and found items. | Visible to involved reporters and campus moderators. |
| `public.recovery_records`| **Permanent Anonymized Analytics**. Contains category, location zone, and duration. | **Zero PII**. Accessible for campus reports and trend graphs. |
| `public.audit_logs` | Immutable tamper-evident audit trail for all custody and lifecycle events. | Append-only. Readable only by Security Officers and Admins. |
| `public.stats` | Real-time global metric counters (active cases, recovery rate, avg recovery time). | Publicly queryable. |

---

## 2. 🔄 Automated Data Lifecycle & Privacy Retention Mechanism

### The Privacy Problem in Campus Portals
When an item is returned, retaining personal identification details (such as personal phone numbers, secret item marks, or student proof files) creates unnecessary privacy and compliance risks.

### The Solution: Transactional Automatic Purge
When an item reaches `RETURNED` status, the PostgreSQL function `public.process_item_returned()` executes atomically within a single database transaction:

```sql
SELECT public.process_item_returned(p_item_id := 'ITEM_UUID', p_item_type := 'Lost');
```

#### What happens during execution:
1. **Verifies Status**: Ensures the item has legally been returned to its confirmed owner.
2. **Generates Anonymized Analytics**: Computes recovery duration (in hours) and logs an anonymized record in `public.recovery_records` with zero student names, roll numbers, or contact numbers.
3. **Purges Temporary PII**:
   - `contact_phone` → Set to `[CLEANED - ITEM FOUND]`
   - `finder_phone` → Set to `[CLEANED - ITEM FOUND]`
   - `finder_note` → Set to `[CLEANED - CASE CLOSED]`
   - `identifying_details` → Set to `[CLEANED FOR PRIVACY]`
   - `image_url` / `image_path` → Cleared / Sanitized
4. **Purges Claim Verification Data**:
   - `verification_data` → Replaced with `{"status": "purged_after_return"}`
   - `proof_file_path` → Cleared
   - `secret_detail` → Sanitized
5. **Appends Audit Event**:
   - Action: `DATA_PURGED`
   - Entity: `ITEM_RECOVERY_CASE`
   - Actor: `System Privacy Engine`

---

## 3. 📦 Supabase Storage Configuration

| Bucket Name | Access Type | Allowed MIME Types | Max File Size | Policy |
| :--- | :--- | :--- | :--- | :--- |
| `lost-item-images` | **Public** | `image/jpeg, image/png, image/webp` | 5 MB | Public Read, Authenticated Insert |
| `found-item-images` | **Public** | `image/jpeg, image/png, image/webp` | 5 MB | Public Read, Authenticated Insert |
| `claim-proof` | **Private** | `image/*, application/pdf` | 10 MB | **Signed URLs Only** (1-hour expiration) |

---

## 4. 🔐 Supabase Authentication & Role Matrix

- **`student`**: Can report lost/found items, submit claims for items, view their own activity, and edit their own profile.
- **`faculty`**: Can report lost/found items and sponsor student item verifications.
- **`security`**: Can review custody chains, update storage locker coordinates, verify claims, and inspect audit logs.
- **`admin` / `super_admin`**: Can manage users, moderate flagged items, adjust system settings, and inspect system audit trails.

---

## 5. 🚀 Setup & Deployment Instructions

### Step 1: Run SQL Migration
1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Open `/supabase/migrations/001_campus_lost_and_found.sql` or copy it from the **Supabase Database Modal** inside the app.
3. Click **RUN** to create all tables, indexes, RLS policies, storage buckets, and automated triggers.

### Step 2: Configure Environment Variables
Ensure your `.env` contains:
```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Step 3: Test Real-Time Sync & Storage
1. Click the **⚡ Supabase** badge in the app navigation bar.
2. Click **TEST SUPABASE CONNECTION** to verify connectivity.
3. Switch to the **Data Lifecycle** tab and click **RUN TEST PURGE** to verify the atomic cleanup routine.
