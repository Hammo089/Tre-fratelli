# Tre Fratelli

Arabic/English restaurant menu, animated pizza and manakish customization, cart, pickup and Beirut delivery, WhatsApp checkout, direct web orders, private order tracking, and a Supabase-backed staff dashboard.

The static frontend uses an explicitly pinned Supabase JS client. `config.js` fetches the public API URL and anonymous key from `/api/config`. Vercel stores these configuration values in environment variables; they are not committed to GitHub. No service role key is shipped to the client. The Edge Function reads its service credential from Supabase's native runtime environment.

## First owner login

Open `/admin.html`, register using the owner email configured privately in the database, and confirm the email through Supabase. Sign in to activate the owner role. Owner activation checks the authenticated, confirmed email on the server. Other users cannot claim it. The owner can create manager and cashier accounts in Staff. Manager: menu, extras, settings, orders. Cashier: order status and payment confirmation. Staff access is checked against the database, so removing a staff row revokes data access immediately.

## Before accepting real orders

Ordering starts paused. Review the migrated menu, size choices, draft extra prices, exchange rate, store address, hours and Whish transfer number in the dashboard. Only the old menu's known sizes are seeded: regular, and Meshrouha (+$1) for manakish. Additional pizza sizes can be added in each item's editor. Initial exchange rate: 89,500 LBP/USD; this is an editable placeholder, not a verified market quote. Delivery: 100,000 LBP. Whish remains unavailable until its destination number is configured.

Original accessible product photos are included. Missing photos use labelled graphic placeholders, replaceable through the image uploader. The customizer uses an SVG illustration of ingredients; it is not a photographic replica of the reference clip. Tap ingredients to add them, toggle base ingredients to remove them, choose size/quantity, and use the oven animation to add the result to the cart. Reduced motion is supported.

WhatsApp orders are stored as `whatsapp_pending`: opening WhatsApp cannot prove that a message was sent. A staff member must confirm receipt. Direct orders start as `pending`. Both channels share an idempotency key. Whish payment is manually confirmed; an optional receipt image is saved privately and accessible to staff using a short-lived signed URL.

## Database and Edge Function

Applied SQL sources are in `supabase/`: schema, seed, least-privilege grants and storage policies, missing-image updates, and private receipts. `record_order` is SECURITY INVOKER and callable only by `service_role`. All exposed tables use RLS. Anonymous users can read the menu/settings but cannot read or write orders. The checkout function validates all options and calculates totals from database prices, ignores client prices, enforces limits and atomically prevents duplicates. Tracking exposes status and totals only, never customer phone/address.

Deploy `supabase/functions/order/index.ts` as `order` with `verify_jwt=true`. `logic.js` must be included alongside it. Staff actions verify the signed-in user separately inside the handler. The initial owner email is configured in a private table; change it only after verifying the intended owner.

## Verification

`npm test`: server pricing, delivery, invalid extras/sizes/removals/quantities, paused orders, unavailable Whish, disabled items, duplicate extras.

`npm run check`: JavaScript syntax.

Live integration checked: order insertion, server-calculated total, idempotency, private tracking, rejected forged extras, blocked anonymous order reads, blocked anonymous staff management. Reports currently cover the latest 1,000 orders; they exclude incomplete/cancelled orders from sales. Dashboard updates use Realtime with a 20-second polling fallback. Print uses the browser dialog; direct silent printing requires additional printer integration.
