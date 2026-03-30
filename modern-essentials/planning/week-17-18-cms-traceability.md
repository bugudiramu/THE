# Weeks 17-18: Sanity CMS, Farm Stories & Batch Traceability

> **Blueprint Ref:** §1.2 (Brand Pillars — Transparency), §3.1 (CMS + Farm Stories — BUY Sanity.io), §4.1 (CMS: Sanity.io), §7.2 (Daily Supply Chain — QR traceability), §17.2 (Content Pillars — Farm transparency, Traceability), §13 Phase 3 Weeks 17-18
> **Sprint Goal:** Farm profile pages and batch traceability QR pages are live on the storefront via Sanity CMS, every packing label has a QR code linking to the batch's full journey from farm to door, and an SEO-optimized blog is publishing content around the brand's transparency pillars.

---

## Current State (End of Week 16)

| Area | Status |
|---|---|
| CMS | **None**. No Sanity.io integration. All product content is in the database. |
| Farm stories | **None**. Farm data exists in `Farm` model but no customer-facing pages. |
| Traceability | `FarmBatch → InventoryBatch` link exists in schema. **No QR codes, no public batch pages**. |
| Blog / SEO | **None**. No content pages beyond product catalog. |
| QR codes | **Not generated**. Packing labels have no QR integration. |

---

## Objectives

1. Set up **Sanity.io** as the headless CMS for non-product content (farm profiles, blog posts, brand pages).
2. Build **farm profile pages** — each farm has a public page with photos, location, story, and QC stats.
3. Build **batch traceability pages** — scannable QR code links to a page showing the full journey of the batch.
4. Create an **SEO blog** with articles on the 4 content pillars (protein education, farm transparency, subscription value, traceability).
5. Implement **QR code generation** on packing labels — links to batch traceability page.

---

## Key Deliverables

### Deliverable 1 — Sanity.io Setup

| Item | Detail |
|---|---|
| Sanity project | Create Sanity project via `sanity init`. Dataset: `production`. |
| Content schemas | `farmProfile`, `blogPost`, `batchStory`, `brandPage`. |
| Sanity Studio | Deployed separately or embedded in admin. Content editors use the Sanity Studio UI. |
| GROQ queries | Reusable query functions for fetching content from Sanity. |
| Environment | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` in `apps/web/.env.local`. |

**Content schemas:**

| Schema | Fields | Purpose |
|---|---|---|
| `farmProfile` | `name`, `slug`, `location`, `photos[]`, `story` (rich text), `farmerName`, `certifications[]`, `foundedYear` | Public farm profile page. |
| `blogPost` | `title`, `slug`, `author`, `publishedAt`, `category`, `hero` (image), `body` (rich text), `seo` (title, description) | SEO blog articles. |
| `batchStory` | `batchId` (ref), `farmSlug`, `photos[]`, `timeline[]` (collection → QC → dispatch), `qcReport` | Batch traceability page content enrichment. |
| `brandPage` | `title`, `slug`, `body` (rich text) | Static pages: About Us, Our Story, Quality Promise. |

### Deliverable 2 — Farm Profile Pages

| Page | Route | Detail |
|---|---|---|
| Farms list | `/farms` | Grid of farm cards with photo, name, location, "Visit" button. |
| Farm detail | `/farms/[slug]` | Full page: hero image, farmer story, location map, certifications, recent batches from this farm, QC pass rate. |

**Data source:** Primary content from Sanity. QC statistics from Prisma (`FarmBatch` + `InventoryBatch`).

### Deliverable 3 — Batch Traceability Pages

| Page | Route | Detail |
|---|---|---|
| Batch trace | `/trace/[batchId]` | Full batch journey: Farm → Collection → QC Check → Warehouse → Packed → Dispatched → Delivered. Timeline visualization. |

**Timeline entries:**
1. 🏡 **Farm**: "Collected at [farm name], [location]" — date, photo
2. 🧪 **QC**: "QC check passed: float test ✓, visual ✓, weight [grade]" — date, results
3. 📦 **Warehouse**: "Stored at [bin location], [hub name]" — date
4. 🚚 **Dispatched**: "Shipped via Shadowfax" — date, tracking ID
5. ✅ **Delivered**: "Delivered to customer" — date

**Data sources:** Prisma (`FarmBatch`, `InventoryBatch`, `Order`) + Sanity (enriched content, photos).

### Deliverable 4 — QR Code Generation

| Item | Detail |
|---|---|
| Generation | Generate QR code SVG/PNG for URL: `https://modernessentials.in/trace/[batchId]`. |
| Integration | Include QR on packing labels. Each package has a unique QR linking to its batch. |
| API endpoint | `GET /admin/inventory/batches/:id/qr` — returns QR code image. |
| Admin view | QR preview and print button on batch detail page. |

### Deliverable 5 — SEO Blog

| Item | Detail |
|---|---|
| Blog listing | `/blog` — paginated list of articles. Categories: Nutrition, Farm Stories, How It Works. |
| Blog post | `/blog/[slug]` — full article with SEO meta tags, structured data, social sharing. |
| Content pillars (§17.2) | Seed 4 articles: "Daily Protein: How Many Eggs Do You Really Need?", "Meet Our Farms", "Subscribe vs Buy: The Real Cost of Eggs", "Scan to Trace: From Farm to Your Door". |
| SEO | `<meta>` tags, OpenGraph, JSON-LD structured data, sitemap.xml generation. |

---

## Proposed Changes

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/lib/sanity.ts`
Sanity client setup: `createClient()` with project ID, dataset, API version.

#### [NEW] `apps/web/src/lib/sanity-queries.ts`
GROQ query functions: `getFarmProfiles()`, `getFarmBySlug()`, `getBlogPosts()`, `getBlogBySlug()`, `getBatchStory()`.

#### [NEW] `apps/web/src/app/farms/page.tsx`
Farm listing page. Fetches from Sanity.

#### [NEW] `apps/web/src/app/farms/[slug]/page.tsx`
Farm detail page. Sanity content + Prisma QC stats.

#### [NEW] `apps/web/src/app/trace/[batchId]/page.tsx`
Batch traceability timeline page. Prisma batch data + Sanity enrichment.

#### [NEW] `apps/web/src/app/blog/page.tsx`
Blog listing page. Fetches from Sanity.

#### [NEW] `apps/web/src/app/blog/[slug]/page.tsx`
Blog post page with SEO meta tags and structured data.

#### [NEW] `apps/web/src/components/trace/BatchTimeline.tsx`
Visual timeline component for batch journey.

#### [NEW] `apps/web/src/components/farms/FarmCard.tsx`
Farm card component for listing page.

#### [MODIFY] `apps/web/src/components/UserHeader.tsx`
Add "Our Farms" nav link. Add "Blog" nav link.

#### [NEW] `apps/web/src/app/sitemap.ts`
Dynamic sitemap generation including farm pages, blog posts, and trace pages.

---

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/inventory/qr.service.ts`
QR code generation: `generateBatchQR(batchId)` — returns SVG/PNG buffer.

#### [MODIFY] `apps/api/src/modules/inventory/inventory.controller.ts`
Add endpoint: `GET /admin/inventory/batches/:id/qr` — returns QR code image.

---

### Sanity CMS

---

#### [NEW] Sanity project (external)
Initialize via `npx sanity init`. Create schemas for `farmProfile`, `blogPost`, `batchStory`, `brandPage`.

#### Content seeding
Create 2-3 farm profiles, 4 blog posts (one per content pillar), 1 batch story.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@sanity/client` | `apps/web` | Sanity headless CMS client |
| `@sanity/image-url` | `apps/web` | Sanity image URL builder |
| `next-sanity` | `apps/web` | Next.js + Sanity integration helpers |
| `qrcode` + `@types/qrcode` | `apps/api` | QR code generation for packing labels |
| `@portabletext/react` | `apps/web` | Render Sanity rich text content |

---

## Out of Scope (Week 19+)

- Metabase BI dashboards → Week 19
- PostHog funnels + A/B testing → Week 20
- Video content on farm pages → Phase 4
- Multi-language content → Phase 4

---

## Verification Plan

### Browser Verification

1. **Farm pages** — `http://localhost:3000/farms`:
   - Farm cards display with photos and names
   - Farm detail page shows story, location, QC stats

2. **Batch traceability** — `http://localhost:3000/trace/[batchId]`:
   - Timeline shows full journey from farm to delivery
   - QR code on page links back to itself

3. **Blog** — `http://localhost:3000/blog`:
   - Articles listed with thumbnails and categories
   - Article page has proper SEO meta tags

4. **QR code** — Admin batch detail:
   - QR code preview renders correctly
   - Scanning QR code opens traceability page

### SEO Verification

5. **Meta tags**: Inspect page source for OpenGraph + JSON-LD
6. **Sitemap**: `http://localhost:3000/sitemap.xml` includes farm + blog + trace URLs

### Build Verification

7. ```bash
   pnpm turbo run build
   ```

### Manual Verification

8. **Sanity Studio**: Content editors can create/edit farm profiles and blog posts
9. **QR print**: Print a label with QR code → scan with phone → traceability page loads
