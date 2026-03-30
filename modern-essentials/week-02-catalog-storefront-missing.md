# Week 2 Product Catalog & Storefront: Missing Pieces & Refinements

Based on an audit of the repository against the `@planning/week-02-catalog-storefront.md` blueprint, the following items are missing, require refinement, or deviate from the original architectural plan.

## High Priority: Backend (NestJS API) Deviations

| Item | Description | Impact |
|---|---|---|
| Soft Delete | `CatalogService.remove` performs a hard `prisma.product.delete` instead of setting `isActive = false`. | Data loss risk; violates §13 Week 2 spec for admin CRUD. |
| `AwsS3Service.deleteFile` | Implementation incorrectly uses `PutObjectCommand` instead of `DeleteObjectCommand`. | File deletion in Cloudflare R2 will likely fail or behave unexpectedly. |
| Global `PrismaModule` | (Carried over from Week 1) Catalog module still provides its own `PrismaService`. | Multiple Prisma client instances; architectural inconsistency. |

## Medium Priority: Frontend (Storefront) Refinements

| Item | Description | Impact |
|---|---|---|
| Missing Footer | `apps/web` layout includes `UserHeader` but no `Footer` component as specified in Deliverable 3. | Incomplete brand experience and missing legal/social links. |
| Image Optimization | Storefront uses standard `<img>` tags or Unsplash URLs without a local optimization layer (e.g., `next/image` is imported but not consistently used with R2). | Sub-optimal performance and potentially higher bandwidth costs. |

## Low Priority: Documentation

| Item | Description | Impact |
|---|---|---|
| Nutrition Info | `ProductDetail` is missing the "nutrition info placeholder" mentioned in Deliverable 3. | Minor UI incompleteness. |

## Suggested Implementation Strategy

1. **Fix `AwsS3Service`**: Update `deleteFile` to use `DeleteObjectCommand` from `@aws-sdk/client-s3`.
2. **Update `CatalogService.remove`**: Change to a soft-delete pattern (`this.prisma.product.update({ where: { id }, data: { isActive: false } })`).
3. **Create `Footer.tsx`**: Add a basic branded footer to `apps/web/src/components` and include it in the root layout.
4. **Refactor Catalog Module**: Once `PrismaModule` is created (see Week 1 missing pieces), remove `PrismaService` from `CatalogModule` providers.

---
*Created by Gemini CLI on 30 March 2026*
