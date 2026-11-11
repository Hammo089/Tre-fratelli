# Graph Report - Tre-fratelli-main  (2026-11-11)

## Corpus Check
- Corpus is ~11,899 words - fits in a single context window. You may not need a graph.

## Summary
- 364 nodes · 666 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 168 edges (avg confidence: 0.85)
- Token cost: 561,432 input · 0 output

## Community Hubs (Navigation)
- Customer Menu App
- Admin Dashboard Logic
- Admin Page & Project README
- Menu Item Images
- Customer Landing Page
- Asset Generation Prompts
- Pizza Builder Sprites
- Builder Asset Pipeline
- SEO Pages & Currency
- Manakish Builder Sprites
- Database Schema & Order Timing
- Order Edge Function & Tests
- Dessert Topping Sprites
- Package Config
- Vercel Config
- Customer Feedback SQL
- Owner Config SQL

## God Nodes (most connected - your core abstractions)
1. `esc()` - 24 edges
2. `render()` - 17 edges
3. `safeImage()` - 15 edges
4. `Tre Fratelli Brand` - 15 edges
5. `renderBuilder()` - 14 edges
6. `renderPizza()` - 14 edges
7. `index.html customer menu page` - 12 edges
8. `Scatter Topping Pieces` - 12 edges
9. `Pizza Topping Sprites` - 12 edges
10. `renderCart()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Neapolitan ingredient layers (dough, sauce, cheese, pepperoni, mushroom, olive, pepper, onion, basil, tomato, meat, turkey)` --conceptually_related_to--> `Pizza sizes 25 cm and 35 cm (35 cm disabled pending pricing)`  [INFERRED]
  assets/pizza-real/PROMPTS.md → README.md
- `Pizza customizer with generated photographic cutouts` --conceptually_related_to--> `Neapolitan ingredient layers (dough, sauce, cheese, pepperoni, mushroom, olive, pepper, onion, basil, tomato, meat, turkey)`  [INFERRED]
  README.md → assets/pizza-real/PROMPTS.md
- `Oven animation add-to-cart (reduced motion supported)` --conceptually_related_to--> `oven-real.webp stone oven scene`  [INFERRED]
  README.md → assets/BUILDER-PROMPTS.md
- `Manakish scattered toppings (mint, cucumber, pickle, arugula, corn, mayonnaise, lettuce, sesame)` --semantically_similar_to--> `Neapolitan ingredient layers (dough, sauce, cheese, pepperoni, mushroom, olive, pepper, onion, basil, tomato, meat, turkey)`  [INFERRED] [semantically similar]
  assets/manakish-real/PROMPTS.md → assets/pizza-real/PROMPTS.md
- `GET()` --calls--> `convertToLbp()`  [EXTRACTED]
  api/page.js → currency.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Order placement and integrity flow** — index_bag_checkout, readme_order_edge_function, readme_server_side_pricing, readme_idempotency_key, readme_record_order, readme_whatsapp_pending_orders, readme_private_order_tracking [INFERRED 0.85]
- **Imagegen transparent overhead cutout asset pipeline** — assets_pizza_real_prompts_ingredient_layers, assets_manakish_real_prompts_scattered_toppings, assets_manakish_real_prompts_spread_layers, assets_builder_prompts_cheese_spread, assets_cheese_slice_prompt_akkawi_slice, assets_akkawi_soft_prompt_akkawi_soft_piece, assets_american_topping_prompts_sausage_chicken, assets_dessert_american_prompts_dessert_assets, assets_square_american_prompts_square_assets, assets_natural_preview_prompts_integrated_bases [INFERRED 0.85]
- **American pizza renderer asset set** — assets_dessert_american_prompts_american_renderer, assets_square_american_prompts_americanpizza, assets_square_american_prompts_square_assets, assets_american_topping_prompts_sausage_chicken, assets_natural_preview_prompts_integrated_bases [INFERRED 0.75]
- **Dessert Pizza Builder Layers (Nutella base + scatterable topping sprites)** — assets_dessert_real_nutella_base, assets_dessert_real_dark_chips, assets_dessert_real_white_chips, assets_dessert_real_lotus, assets_dessert_real_lotus_crumb, assets_dessert_real_oreo, assets_dessert_real_oreo_crumb, assets_dessert_real_white_chocolate, assets_dessert_real_white_chocolate_shard [INFERRED 0.85]
- **Generated SVG placeholder cards for menu items lacking a real photo** — assets_items_dr_7up_diet, assets_items_dr_7up, assets_items_dr_mirinda_diet, assets_items_dr_mirinda, assets_items_dr_pepsi_diet, assets_items_dr_pepsi, assets_items_dr_yogurt, assets_items_ds_cinnamon_rolls, assets_items_ds_tiramisu_1p, assets_items_ds_tiramisu_2p, assets_items_mk_cocktail, assets_items_mk_spinach, assets_items_mk_tomato_onion, assets_items_pz_marinara [INFERRED 0.95]
- **Real food photographs of menu items (manakish and pizzas)** — assets_items_mk_cheese, assets_items_mk_keshek, assets_items_mk_meat, assets_items_mk_zaatar, assets_items_pz_bresaola, assets_items_pz_margherita, assets_items_pz_pepperoni, assets_items_pz_truffle, assets_items_pz_vegetarian [INFERRED 0.85]
- **Full-disk spread layers composited over the dough base** — assets_manakish_real_manakish_dough, assets_manakish_real_zaatar, assets_manakish_real_cheese_spread, assets_manakish_real_minced, assets_manakish_real_spinach [INFERRED 0.85]
- **Fresh vegetable and herb scatter toppings** — assets_manakish_real_arugula, assets_manakish_real_lettuce, assets_manakish_real_mint, assets_manakish_real_cucumber, assets_manakish_real_pickle, assets_manakish_real_corn [INFERRED 0.75]
- **Italian Round Base Layer Stack (dough, sauce, cheese)** — assets_pizza_real_cheese, assets_pizza_real_dough, assets_pizza_real_sauce [INFERRED 0.85]
- **American Square/Pan Layer Stack** — assets_pizza_real_american_pan_cheese, assets_pizza_real_american_pan_sauce, assets_pizza_real_american_square_cheese, assets_pizza_real_american_square_dough [INFERRED 0.75]
- **Selectable Pizza Builder Toppings** — assets_pizza_real_basil, assets_pizza_real_chicken, assets_pizza_real_meat, assets_pizza_real_mushroom, assets_pizza_real_olive, assets_pizza_real_onion, assets_pizza_real_pepper, assets_pizza_real_pepperoni, assets_pizza_real_sausage, assets_pizza_real_tomato, assets_pizza_real_turkey [INFERRED 0.85]

## Communities (29 total, 13 thin omitted)

### Community 0 - "Customer Menu App"
Cohesion: 0.11
Nodes (39): activeFlights, cart, catNames, clearIngredientFlights(), cuisineTheme(), customerTiming(), extras, extraSummary() (+31 more)

### Community 1 - "Admin Dashboard Logic"
Cohesion: 0.12
Nodes (37): area(), authorized(), beep(), beirutBoundary(), boot(), edit(), extras, input() (+29 more)

### Community 2 - "Admin Page & Project README"
Cohesion: 0.08
Nodes (27): admin.html restaurant dashboard page, Editor and ledger detail dialogs, Staff login and signup form, Operations bar, Dashboard sidebar pages (orders, ledger, feedback, menu, extras, reports, offers, landing, settings, staff, guide), Bag and checkout form (delivery/pickup, cash/Whish, web/WhatsApp), Tre Fratelli README, /api/config public configuration endpoint (+19 more)

### Community 3 - "Menu Item Images"
Cohesion: 0.10
Nodes (29): Desserts Menu Category (ds- prefix), 7 Up (drink placeholder image), 7 Up Diet (drink placeholder image), Mirinda (drink placeholder image), Mirinda Diet (drink placeholder image), Pepsi (drink placeholder image), Pepsi Diet (drink placeholder image), Yogurt Drink (drink placeholder image) (+21 more)

### Community 4 - "Customer Landing Page"
Cohesion: 0.09
Nodes (25): Background music credits, Bushwick Tarantella Loop (softened, slower edit), Creative Commons Attribution 4.0 license, Kevin MacLeod (incompetech.com), Music playback behavior (autoplay or first interaction, Off preference, pause when hidden), Website creator credit (Ahmad Hamo), Customer feedback form, Heritage strip (stone oven, 100% Italian ingredients) (+17 more)

### Community 5 - "Asset Generation Prompts"
Cohesion: 0.09
Nodes (24): Akkawi soft piece prompt, akkawi-soft-piece.webp asset, ingredient-settle animation, American topping prompts, sausage.webp and chicken.webp topping cutouts, Akkawi cheese slice prompt, akkawi-slice.webp asset, Dessert and American pizza prompts (+16 more)

### Community 6 - "Pizza Builder Sprites"
Cohesion: 0.14
Nodes (25): American Round Melted Cheese Layer, American Round Dough Base, American Pan Sauce-and-Cheese Layer (square), American Pan Tomato Sauce Layer (square), American Round Pizza Variant, American Square Melted Cheese Layer, American Square Dough Base, American Square/Pan Pizza Variant (+17 more)

### Community 7 - "Builder Asset Pipeline"
Cohesion: 0.13
Nodes (21): Builder photographic assets prompts, cheese-spread.webp (Akkawi and Halloumi disk), oven-real.webp stone oven scene, Generated manakish imagery prompts, manakish-dough base layer, Manakish scattered toppings (mint, cucumber, pickle, arugula, corn, mayonnaise, lettuce, sesame), Manakish spread layers (zaatar, kishk, minced, spinach), Photographic Neapolitan pizza assets prompts (+13 more)

### Community 8 - "SEO Pages & Currency"
Cohesion: 0.24
Nodes (14): GET(), GET(), money(), convertToLbp(), formatLbp(), applyLanding(), normalizeOrder(), orderAllItems() (+6 more)

### Community 9 - "Manakish Builder Sprites"
Cohesion: 0.19
Nodes (19): Akkawi Cheese Slice (fresh white strip sprite), Akkawi Soft Piece (melted, browned cheese sprite), Arugula Leaves (scatter sprite sheet), Cheese Spread (melted cheese full-disk layer), Corn Kernels (scatter sprite sheet), Cucumber Slices (scatter sprite sheet), Full-Disk Spread Layer, Manakish Builder Ingredient Sprites (+11 more)

### Community 10 - "Database Schema & Order Timing"
Cohesion: 0.16
Nodes (12): order_timing, public.set_order_timing(), menu_category_sort, orders_ip_created, orders_phone_created, orders_status_created, public.extras, public.menu_items (+4 more)

### Community 11 - "Order Edge Function & Tests"
Cohesion: 0.16
Nodes (6): cors, db, validateOrder(), extra, item, settings

### Community 12 - "Dessert Topping Sprites"
Cohesion: 0.22
Nodes (13): Dark Chocolate Chip Sprite, Dessert Pizza Topping Sprites (pizza builder), Whole Lotus Biscoff Biscuit Sprite, Lotus Biscoff Biscuit Crumb Sprite, Nutella-Spread Dessert Pizza Base (top-down), Broken Oreo Cookie Half Sprite, Oreo Cookie Crumb Sprite, White Chocolate Chip Sprite (+5 more)

### Community 13 - "Package Config"
Cohesion: 0.25
Nodes (7): name, private, scripts, check, test, type, version

### Community 14 - "Vercel Config"
Cohesion: 0.33
Nodes (5): includeFiles, functions, api/page.js, headers, rewrites

### Community 15 - "Customer Feedback SQL"
Cohesion: 0.83
Nodes (3): feedback_ip_created, public.customer_feedback, public.record_feedback()

## Ambiguous Edges - Review These
- `order Edge Function (supabase/functions/order/index.ts, verify_jwt=true)` → `Private customer feedback via rate-limited Edge Function`  [AMBIGUOUS]
  README.md · relation: references

## Knowledge Gaps
- **31 isolated node(s):** `Tre Fratelli README`, `Exchange rate 89,500 LBP/USD (editable placeholder)`, `Row Level Security on all exposed tables`, `logic.js (bundled with order function)`, `Verification: npm test and npm run check` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 98 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `index.html customer menu page` connect `Customer Landing Page` to `Customer Menu App`, `Admin Page & Project README`, `Builder Asset Pipeline`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `Tre Fratelli README`, `Exchange rate 89,500 LBP/USD (editable placeholder)`, `Row Level Security on all exposed tables` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Customer Menu App` be split into smaller, more focused modules?**
  _Cohesion score 0.10782241014799154 - nodes in this community are weakly interconnected._
- **Why does `admin.html restaurant dashboard page` connect `Admin Page & Project README` to `Admin Dashboard Logic`, `Customer Landing Page`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Admin Dashboard Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.12070874861572536 - nodes in this community are weakly interconnected._
- **Should `Admin Page & Project README` be split into smaller, more focused modules?**
  _Cohesion score 0.08045977011494253 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `order Edge Function (supabase/functions/order/index.ts, verify_jwt=true)` and `Private customer feedback via rate-limited Edge Function`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._