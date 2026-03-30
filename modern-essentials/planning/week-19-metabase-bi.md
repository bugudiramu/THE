# Week 19: Metabase BI Dashboards & Ops Intelligence

> **Blueprint Ref:** §3.5 (Analytics + BI — Metabase), §4.1 (Ops BI: Metabase self-hosted on Railway), §12.1 (Analytics Tools), §12.2 (Weekly Review Metrics — 10 core metrics), §13 Phase 3 Week 19
> **Sprint Goal:** A self-hosted Metabase instance connects to a Postgres read replica and serves 5 core operational dashboards (MRR, Churn, Inventory, Delivery, Finance) — giving the ops team real-time BI without impacting the production database.

---

## Current State (End of Week 18)

| Area | Status |
|---|---|
| Analytics | **None**. No BI tool connected. All data analysis requires manual SQL queries. |
| Read replica | **None**. A single Postgres instance serves everything. |
| Metrics | The 10 weekly review metrics from §12.2 exist only on paper. **No dashboards**. |
| Metabase | **Not installed**. |

---

## Objectives

1. Set up a **Postgres read replica** on Railway for BI queries (protects production from heavy analytics).
2. Deploy **Metabase** (self-hosted) on Railway, connected to the read replica.
3. Build **5 core BI dashboards** covering the 10 weekly review metrics from §12.2.
4. Configure **scheduled email reports** for weekly review metrics.
5. Create **saved SQL queries** for ad-hoc ops analysis.

---

## Key Deliverables

### Deliverable 1 — PostgreSQL Read Replica

| Item | Detail |
|---|---|
| Railway setup | Create a Postgres read replica on Railway (one-click from primary DB). |
| Connection | `DATABASE_REPLICA_URL` environment variable for Metabase. |
| Lag monitoring | Verify replication lag < 30 seconds. |
| Protection | Application code NEVER writes to the replica. BI tools ONLY connect here. |

### Deliverable 2 — Metabase Deployment

| Item | Detail |
|---|---|
| Deployment | Self-host Metabase on Railway (Docker image: `metabase/metabase`). |
| Database connection | Connect to read replica. Create a "Modern Essentials" database in Metabase. |
| User accounts | Admin account for founder. Read-only accounts for ops team. |
| Access | Internal-only URL. Protect with basic auth or VPN. |

### Deliverable 3 — BI Dashboards (per §12.2)

#### Dashboard 1: Revenue & Subscriptions

| Card | Metric | Formula |
|---|---|---|
| MRR | Monthly Recurring Revenue | `SUM(active subscription monthly values)` |
| Net MRR Churn | Net revenue churn rate | `(Churned MRR - Expansion MRR) / Prior MRR` |
| Subscriber Churn Rate | Monthly churn | `Cancelled subs / Active subs at period start` |
| Subscription Pause Rate | Weekly pause rate | `Paused this week / Active subs` (alert if > 15%) |
| Revenue trend | GMV over time | Line chart: daily/weekly/monthly GMV |

#### Dashboard 2: Orders & Delivery

| Card | Metric | Formula |
|---|---|---|
| On-time Delivery % | Delivery SLA compliance | `Delivered by slot time / Total dispatched` (target > 95%) |
| Complaint Rate | Quality issues | `Support tickets / Orders delivered` (target < 2%) |
| Orders by Status | Current state | Stacked bar: PENDING, PAID, PICKED, PACKED, DISPATCHED, DELIVERED |
| Delivery by Hub | Hub performance | Orders per hub, delivery time distribution |

#### Dashboard 3: Inventory & Wastage

| Card | Metric | Formula |
|---|---|---|
| Inventory Wastage % | Stock loss | `Units written off / Units received` (target < 3%) |
| FEFO Compliance | Dispatch ordering | `Out-of-order dispatches / Total dispatched` (target 0%) |
| Days of Cover | Stock runway | Per-SKU: current stock / daily demand rate |
| Expiry Alerts | Near-expiry batches | Batches expiring in < 3 days |

#### Dashboard 4: Customer Acquisition

| Card | Metric | Formula |
|---|---|---|
| CAC by Channel | Acquisition cost | `Spend / New subscribers acquired` (target < ₹300) |
| LTV:CAC Ratio | Unit economics | `12-month LTV / CAC` (target > 5x) |
| Referral Conversion | Referral effectiveness | Referred signups → first order → subscription rate |
| Cohort Retention | Monthly cohorts | Retention grid: Month 1 → Month 6 |

#### Dashboard 5: Weekly Review Summary

| Card | Detail |
|---|---|
| All 10 metrics | Single-view summary of all §12.2 metrics with target indicators (green/yellow/red) |
| Trends | Week-over-week change arrows |
| Alerts | Red badges for metrics outside target range |

### Deliverable 4 — Saved SQL Queries

| Query | Purpose |
|---|---|
| Top 10 SKUs by revenue | Product performance ranking |
| Subscriber LTV distribution | Histogram of subscriber values |
| Dunning success rate | Recovery rate by attempt number |
| Hub-level delivery performance | Per-hub on-time % |
| Daily order volume forecast | Based on subscription schedule |

### Deliverable 5 — Scheduled Reports

| Report | Frequency | Recipients | Content |
|---|---|---|---|
| Weekly Review | Monday 9 AM | Founder, Ops lead | All 10 metrics with week-over-week comparison |
| Daily Orders | Daily 6 PM | Ops manager | Today's order summary + delivery completion % |
| Inventory Alert | Daily 7 AM | Procurement | Batches expiring < 3 days + low stock alerts |

---

## Proposed Changes

### Infrastructure

---

#### [NEW] Railway: PostgreSQL Read Replica
One-click setup from primary Railway Postgres. Auto-syncs.

#### [NEW] Railway: Metabase Service
Deploy `metabase/metabase` Docker image. Persist data in attached Postgres (Metabase's own DB).

---

### Backend — NestJS API

---

#### [MODIFY] `apps/api/.env`
Add `DATABASE_REPLICA_URL` (for reference, Metabase connects directly).

---

### Documentation

---

#### [NEW] `docs/metabase-setup.md`
Setup guide: Railway deployment, database connection, user creation, dashboard configuration.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| Metabase (Docker) | Railway | Self-hosted BI platform — zero cost |

---

## Out of Scope (Week 20)

- PostHog product funnels → Week 20
- Custom analytics API for storefront → Phase 4
- AI-powered inventory forecasting → Phase 4
- Real-time dashboards (WebSocket) → Phase 4

---

## Verification Plan

### Infrastructure Verification

1. **Read replica**:
   - Verify replication lag < 30 seconds
   - Verify writes to primary appear on replica
   - Verify replica rejects write queries

2. **Metabase deployment**:
   - Verify Metabase UI loads on Railway URL
   - Verify database connection shows all tables
   - Verify queries execute correctly

### Dashboard Verification

3. **Weekly review dashboard**: All 10 metrics compute correctly:
   - MRR matches manual calculation from active subscriptions
   - Churn rate matches manual count
   - Wastage % matches wastage log totals

4. **Scheduled reports**: Test email delivery of weekly summary

### Manual Verification

5. **Production safety**: Confirm no heavy Metabase query impacts the primary DB (all queries hit replica)
6. **Access control**: Verify ops team can view dashboards but not modify SQL
