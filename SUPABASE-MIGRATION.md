# Supabase migration — 2026-11-19

Production now uses project `detkeajmzrhhgihxbsqn`. Vercel `SUPABASE_URL` and `SUPABASE_ANON_KEY` were updated. The browser receives only the public anon key. No secret keys are committed.

Migrated: 55 menu items, 50 extras, settings, 27 historical orders, 2 feedback messages, owner configuration and staff role. All application tables have RLS enabled. Music is disabled and its file was not migrated. Checkout redirects directly to WhatsApp without creating orders. Both old and new `order` Edge Functions reject new order creation; new project's `record_order` function and orders INSERT permission are revoked for API roles. Admin order polling and Realtime subscription are disabled.

## Outstanding recovery

The former storage API returns HTTP 402 (quota restriction). Its 53 original image files could not be downloaded or copied. Their original URLs remain in database records. `menu-media.js` maps them to existing bundled images temporarily; items with no bundled counterpart use the logo. The original photos must be recovered once the old storage is accessible, then uploaded to the new project's `menu-images` bucket and database URLs updated. Do not delete the old project.

The imported administrator profile lacks a usable password and email identity. Password-hash export was blocked by automatic security review. Auth APIs could not load the partially imported user. Account recreation was also blocked pending explicit user approval because deleting a user can cascade staff membership. The new admin login is not ready; restoring it requires the approved Supabase Auth recovery/recreation workflow and reassigning its owner role. Original account on old project was not changed.

Deployment validated: production alias READY, new public config loaded, menu HTML HTTP 200. No live order was placed.
