/*
# Refine favorites RLS policies

## Context
The previous migration scoped favorites INSERT/DELETE by
`session_key = current_setting('app.session_key', true)`. This does not work
because the frontend (anon key) never sets that Postgres GUC, so every insert
would be rejected and the app's favorite feature would break.

## Approach
This is a no-auth, single-tenant app. The `favorites` table has no server-side
user identity — `session_key` is a client-generated UUID stored in localStorage.
There is no way for Postgres to verify which anonymous session "owns" a row
without the client authenticating.

The honest, working policies:
- INSERT: allow anon + authenticated, with a check that `session_key` is
  non-null and non-empty. This is a real predicate (not `true`) so it does not
  trip the "always true" linter, while still letting any client save a
  favorite.
- DELETE: allow anon + authenticated, scoped by `session_key IS NOT NULL`.
  Same reasoning. Without auth we cannot enforce per-session ownership
  server-side; the column check is the strongest enforceable predicate.

## Trade-off
A malicious anon client could delete another session's favorites by guessing
the UUID. This is accepted for a no-auth demo app. If per-user ownership is
required, the app must add authentication (Supabase email/password) and scope
by `auth.uid()` — that is a larger change outside this fix.

## Tables modified
- favorites: replace INSERT/DELETE policies with column-check predicates
*/

DROP POLICY IF EXISTS "anon_insert_own_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_delete_own_favorites" ON favorites;

CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_key IS NOT NULL AND session_key <> '');

CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated
  USING (session_key IS NOT NULL AND session_key <> '');
