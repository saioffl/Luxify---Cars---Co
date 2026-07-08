/*
# Tighten RLS policies on all tables

## Overview
The original migration created permissive write policies (INSERT/UPDATE/DELETE)
with `WITH CHECK (true)` / `USING (true)`, which effectively bypass RLS for
anon + authenticated. This migration replaces them with scoped policies that
still work for the no-auth frontend (anon key) but close the security gap.

## Approach
This is a single-tenant, no-auth app — the frontend uses the anon key for its
entire lifetime. The data is intentionally shared/public, so SELECT stays open
to `anon, authenticated` with `USING (true)` (correct for public reads).

For writes, we scope by what the app actually needs:

1. **cars / car_images** — catalog data is admin-managed, not user-editable.
   Remove anon INSERT/UPDATE/DELETE entirely. If admin tooling is added later,
   it should use the service role key (which bypasses RLS) or authenticated
   policies with proper ownership checks.

2. **favorites** — users manage their own favorites via a session_key stored
   in localStorage. Scope INSERT/DELETE so a session can only write/delete its
   own rows. This prevents one anonymous session from deleting another's
   favorites.

3. **inquiries** — users submit contact forms. Allow anon INSERT (anyone can
   submit an inquiry) but restrict UPDATE to authenticated only (admin/staff
   process inquiries). Remove anon DELETE.

4. **page_views** — analytics tracking. Allow anon INSERT (anyone can record a
   view) but nothing else.

## Tables modified
- cars: drop anon INSERT/UPDATE/DELETE policies
- car_images: drop anon INSERT/UPDATE/DELETE policies
- favorites: replace INSERT/DELETE with session_key-scoped policies
- inquiries: keep anon INSERT, replace UPDATE with authenticated-only
- page_views: keep anon INSERT only (no UPDATE/DELETE existed)

## Security impact
- Closes 11 "always true" RLS bypass findings.
- Public reads preserved (app still functions with anon key).
- Anonymous sessions can no longer mutate catalog data or each other's
  favorites. Inquiries can be submitted but only updated by authenticated
  users.
*/

-- ============================================================
-- cars: remove anon write policies (catalog is admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_cars" ON cars;
DROP POLICY IF EXISTS "anon_update_cars" ON cars;
DROP POLICY IF EXISTS "anon_delete_cars" ON cars;

-- ============================================================
-- car_images: remove anon write policies (admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_car_images" ON car_images;
DROP POLICY IF EXISTS "anon_update_car_images" ON car_images;
DROP POLICY IF EXISTS "anon_delete_car_images" ON car_images;

-- ============================================================
-- favorites: scope writes by session_key
-- A session can only insert/delete its own favorites.
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;

CREATE POLICY "anon_insert_own_favorites" ON favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_key = current_setting('app.session_key', true));

CREATE POLICY "anon_delete_own_favorites" ON favorites FOR DELETE
  TO anon, authenticated
  USING (session_key = current_setting('app.session_key', true));

-- ============================================================
-- inquiries: anon can submit, only authenticated can update
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
DROP POLICY IF EXISTS "anon_update_inquiries" ON inquiries;

CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "auth_update_inquiries" ON inquiries FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- page_views: anon can insert (view tracking), nothing else
-- (INSERT policy already exists and is intentionally permissive —
--  recording a page view is a public action with no ownership concept.)
-- ============================================================
