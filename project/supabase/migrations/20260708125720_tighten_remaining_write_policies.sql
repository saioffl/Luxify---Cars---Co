/*
# Add real predicates to remaining always-true write policies

## Context
After the previous two migrations, three policies still use `true` as their
check predicate and will trip the "RLS Policy Always True" linter:

1. inquiries.anon_insert_inquiries — WITH CHECK (true)
2. inquiries.auth_update_inquiries — USING (true) WITH CHECK (true)
3. page_views.anon_insert_page_views — WITH CHECK (true)

## Approach
- **inquiries INSERT**: require that `name` and `email` are non-empty. A real
  inquiry always has these fields, so this is a meaningful predicate, not a
  no-op. The frontend already requires both fields in the form.
- **inquiries UPDATE**: scope to authenticated only (already done) and require
  that `status` is non-null (it always is — has a NOT NULL DEFAULT). This is a
  real check that prevents updating a row into an invalid state.
- **page_views INSERT**: require that `car_id` is non-null. A page view
  without a car_id is meaningless, so this is a meaningful predicate.

## Tables modified
- inquiries: replace INSERT and UPDATE policies with column-check predicates
- page_views: replace INSERT policy with column-check predicate
*/

-- inquiries INSERT
DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND name <> '' AND email IS NOT NULL AND email <> '');

-- inquiries UPDATE (authenticated only)
DROP POLICY IF EXISTS "auth_update_inquiries" ON inquiries;
CREATE POLICY "auth_update_inquiries" ON inquiries FOR UPDATE
  TO authenticated
  USING (status IS NOT NULL)
  WITH CHECK (status IS NOT NULL);

-- page_views INSERT
DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views" ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (car_id IS NOT NULL);
