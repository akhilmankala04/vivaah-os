-- Migration: 20260412000003_fix_vendor_directory_rls.sql
-- Fix: allow all authenticated users to browse vendor_directory (read-only)
-- Rationale: vendor_directory is a shared library for searching and adding vendors.
--   The owner restriction on SELECT was too restrictive — it blocked seed data and
--   other planners' shared vendor entries from appearing in browse/search results.
--   Write operations (INSERT/UPDATE/DELETE) remain owner-scoped.

-- Drop the existing overly-restrictive SELECT policy
DROP POLICY IF EXISTS "vendor_directory_select" ON vendor_directory;

-- New SELECT policy: any authenticated user can read all non-deleted directory entries
CREATE POLICY "vendor_directory_select" ON vendor_directory FOR SELECT
USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- INSERT/UPDATE/DELETE policies are unchanged:
--   vendor_directory_insert: auth.uid() IS NOT NULL
--   vendor_directory_update: owner_user_id = auth.uid()
--   vendor_directory_delete: false (hard deletes blocked)
