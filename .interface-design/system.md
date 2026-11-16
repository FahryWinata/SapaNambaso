# Interface Design System: SAPA NAMBASO Blue Direction

## Direction & Domain Exploration
- **Domain**: Indonesian regional civic revenue and motor vehicle tax public registry (UPTB Pendapatan Daerah Wilayah I Palu / Samsat Palu).
- **Users**: Vehicle owners in Kota Palu checking PNBP tariffs, required documents, WITA counter hours, and Gerai locations on mobile devices, plus Samsat officers managing drafts and G1 s.d. G13 analytics.
- **Visual Direction (`/ui-ux-design-pro`)**: Civic Trust Royal Blue (`#1E3A8A`, `#1D4ED8`, `#2563EB`) layered over crisp Ice-Slate (`#F8FAFC`) and Pure White (`#FFFFFF`) cards with subtle blue-tinted shadows (`--shadow-premium`, `--shadow-brand`) and frosted sticky header depth.

## Color World & Semantic Roles
- **Canvas & Surfaces**: `--bg-page: #F8FAFC`, `--bg-surface: #FFFFFF`, `--bg-subtle: #EFF6FF`, `--bg-tint: #DBEAFE`.
- **Royal Blue Showcase**: `--hero-bg: #1E3A8A` with gradient depth (`#1E3A8A` to `#1D4ED8` to `#1E40AF`) and subtle soft top-right radial light.
- **Primary Brand & Ink**: `--brand-primary: #1E3A8A`, `--text-primary: #0F172A`, `--text-secondary: #334155`.
- **Single Primary Action Accent**: `--accent-primary: #1D4ED8`, `--accent-hover: #1E40AF`, `--accent-bright: #2563EB`, `--accent-ink: #FFFFFF`.
- **Dark Mode Counterpart**: `--bg-page: #091122`, `--bg-surface: #111E36`, `--bg-subtle: #060B17`, `--brand-primary: #93C5FD`, `--accent-primary: #60A5FA`, `--accent-hover: #38BDF8`, `--accent-ink: #091122`.

## Signature Decisions
1. **Royal Blue Showcase Hero with Nested Civic Operational Card**: Places the Cek Pajak CTA inside a high-contrast `#1E3A8A` / `#1D4ED8` showcase frame paired with a crisp `#FFFFFF` operational card displaying live WITA counter status and the Kantor Induk visual.
2. **Numbered Ledger Headers (`01` s.d. `07`)**: Every major section pairs a tabular section counter badge with a bold Royal Navy heading and 2px `#1D4ED8` accent underline.
3. **Interactive Service Index Badges**: Each `<details>` service row features a numeric index badge (`01` s.d. `06`) in `#EFF6FF` / `#1D4ED8` that flips to solid `#1D4ED8` / `#FFFFFF` when expanded.
4. **Featured Kantor Induk Blue Accent Card**: Highlights the Jl. Kartini main office above the 3-column branch grid using `--shadow-brand` and Royal Blue header emphasis.
5. **Unified Public and Admin Token System**: Both `/` and `/admin` (including G1/G13 SVG trend lines and the G3 WITA heatmap) use the exact same Royal Blue palette.

## Defaults Rejected
- Rejected fake SaaS social-proof logo strips, fabricated metrics ("1000+ users"), and invented citizen testimonials to remain strictly compliant with government integrity (`antislop-copywriting`).
- Rejected pill-shaped radius on every card; preserved structured component radius steps (`6px` inputs, `10px` buttons/rows, `16px` cards/modals, `24px` hero frame).
- Rejected low-contrast pastel blue text on light cards; every text and border token is verified with `contrast-check.py`.

## Component Checkpoints
- **Frosted Sticky Navigation**: `rgba(255, 255, 255, 0.9)` + `backdrop-filter: blur(16px) saturate(180%)`, min-height 44px touch targets, subtle `#EFF6FF` pill hover states.
- **Data Tables & Accordions**: Native `<details>` service and FAQ rows, `1px` soft blue row dividers, hover highlights in `#EFF6FF`, `44px` minimum hit targets.
- **Status Badges & Focus Rings**: Explicit text + color status pills (`BUKA` / `TUTUP`), `3px solid var(--focus-ring)` focus outlines with `2px` offset.

