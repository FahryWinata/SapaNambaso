# DESIGN.md: SAPA NAMBASO (UPTB Pendapatan Daerah Wilayah I Palu)

## Identity & Purpose
- **Product**: SAPA NAMBASO (Sistem Akses Pelayanan Administrasi Nambaso)
- **Owner**: UPTB Pendapatan Daerah Wilayah I Palu (Samsat Palu), Bapenda Provinsi Sulawesi Tengah
- **Dial**: `ENERGY 2 / RHYTHM 2 / MOTION 1`
- **Visual Language**: Civic Sky Blue & Tabular Registry (`/ui-ux-design-pro` + `antislop`). Airy Light Sky Blue (`#38BDF8`, `#7DD3FC`, `#BAE6FD`) focal showcase paired with crisp Cool Sky-Ice surfaces (`#F0F9FF`, `#FFFFFF`, `#E0F2FE`) and deep cerulean text (`#075985`, `#082F49`), designed for citizens checking motor vehicle tax requirements on mobile phones and officers updating content from the field.

## Color Tokens (WCAG AA Verified)
Palette strictly bounded to a coherent Light Sky Blue scale (`#38BDF8`, `#7DD3FC`, `#0EA5E9`, `#075985`) over Sky-Ice (`#F0F9FF`), Pure White (`#FFFFFF`), and Sky-Tint (`#E0F2FE` / `#BAE6FD`), plus accessible semantic status pairs.

### Light Theme (Default)
- `--bg-page`: `#F0F9FF` (Soft Sky 50 canvas)
- `--bg-surface`: `#FFFFFF` (Pure White elevated card and table surface)
- `--bg-subtle`: `#E0F2FE` (Sky 100 secondary structural band and hover tint)
- `--bg-tint`: `#BAE6FD` (Sky 200 badge and highlight surface)
- `--brand-primary`: `#075985` (Deep Sky 800 heading and structural text ink; `7.09:1` on `#F0F9FF`, `7.56:1` on `#FFFFFF`, `6.59:1` on `#E0F2FE`, `5.70:1` on `#BAE6FD`)
- `--text-primary`: `#0F172A` (Deep Slate-Navy 900 body ink)
- `--text-secondary`: `#334155` (Slate 700 secondary ink; `10.35:1` on `#FFFFFF`)
- `--accent-primary`: `#38BDF8` (Light Sky Blue 400 primary CTA and active state; `6.48:1` with `#082F49` ink)
- `--accent-hover`: `#0EA5E9` (Sky Blue 500 hover/active state; `5.01:1` with `#082F49` ink)
- `--accent-bright`: `#7DD3FC` (Light Sky Blue 300 hero accent and highlights; `8.32:1` with `#082F49` ink)
- `--accent-ink`: `#082F49` (Deep Sky 950 high-contrast ink on Light Sky Blue)
- `--hero-bg`: `#7DD3FC` (Light Sky Blue hero showcase fallback paired with `linear-gradient(145deg, #BAE6FD 0%, #7DD3FC 48%, #38BDF8 100%)`; `#082F49` text on `#38BDF8` is `6.48:1`, on `#7DD3FC` is `8.32:1`)
- `--border-strong`: `#64748B` (Slate 500 control and ledger border)
- `--border-soft`: `#BAE6FD` (Sky 200 subtle divider)
- `--focus-ring`: `#0284C7` (Sky 600 3px solid focus outline with 2px offset)
- `--status-open-bg`: `#ECFDF5`, `--status-open-ink`: `#065F46` (`7.29:1`)
- `--status-closed-bg`: `#FEF2F2`, `--status-closed-ink`: `#991B1B` (`7.60:1`)
- `--status-warn-bg`: `#FFFBEB`, `--status-warn-ink`: `#92400E` (`6.84:1`)

### Dark Theme (Toggleable)
- `--bg-page`: `#091122` (Midnight Navy-Blue Level 0 base)
- `--bg-surface`: `#111E36` (Elevated Deep Blue-Slate Level 1 surface)
- `--bg-subtle`: `#060B17` (Secondary structural band)
- `--bg-tint`: `#1E293B` (Badge and chip surface)
- `--brand-primary`: `#7DD3FC` (Light Sky Blue 300 heading ink; `9.97:1` on `#111E36`)
- `--text-primary`: `#F8FAFC` (Ice-White body ink)
- `--text-secondary`: `#CBD5E1` (Slate 300 secondary ink)
- `--accent-primary`: `#38BDF8` (Light Sky Blue 400 primary CTA; `6.48:1` with `#082F49` dark ink)
- `--accent-hover`: `#7DD3FC` (Hover light sky blue; `8.32:1` with `#082F49` dark ink)
- `--accent-ink`: `#082F49` (Deep Sky 950 ink on light sky CTAs)
- `--border-strong`: `#94A3B8` (Slate 400 control border)
- `--border-soft`: `#075985` (Subtle dark-mode sky divider)
- `--focus-ring`: `#38BDF8` (3px solid light sky-blue focus outline with 2px offset)
- `--status-open-bg`: `#064E3B`, `--status-open-ink`: `#D1FAE5` (`8.57:1`)
- `--status-closed-bg`: `#7F1D1D`, `--status-closed-ink`: `#FEE2E2` (`8.20:1`)
- `--status-warn-bg`: `#78350F`, `--status-warn-ink`: `#FEF3C7` (`8.15:1`)

## Typography & Elevation
- **Font Family**: `'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif` (clean Indonesian diacritics and tabular numerals).
- **Tabular Numerals**: `font-variant-numeric: tabular-nums` on WITA clocks, numbered section counters (`01` s.d. `07`), PNBP fee tables, phone numbers, and analytics counts.
- **Scale**: Fluid `clamp()` headings (`h1`: `clamp(1.85rem, 3.8vw, 2.85rem)`, `h2`: `clamp(1.375rem, 2.5vw, 1.875rem)`, body minimum `1rem` / `16px`).
- **Elevation & Radii**: Layered blue-tinted shadows (`--shadow-premium` and `--shadow-brand`) paired with distinct component radius roles (`--radius-sm: 6px` inputs/badges, `--radius-md: 10px` buttons/panels, `--radius-lg: 16px` cards/dialogs, `--radius-xl: 24px` hero showcase).

## Liveliness Levers & Identity Motif
- **Identity Motif**: **Nambaso Blue Showcase + Tabular Civic Ledger**, combining a Royal Blue focal hero container holding an elevated white operational preview card (live WITA status + Kantor Induk visual) with numbered section ledgers (`01` s.d. `07`) bordered by a crisp 2px Royal Blue rule.
- **One Focal Point Per Screen**: On the public hero, the Cek Pajak Kendaraan CTA and live operational card; on the Admin panel, the Draft/Publish workflow bar and 90-day data freshness alert.
- **One Deliberate Accent**: `#1D4ED8` (Light) / `#60A5FA` (Dark) anchoring primary CTAs, active tabs, and interactive highlights.

## One-Line Design Reasons (R-31)
- **Color**: Royal Blue (`#1E3A8A`, `#1D4ED8`, `#2563EB`) over cool Ice-Slate (`#F8FAFC`) and Pure White (`#FFFFFF`) establishes trustworthy civic governance clarity while passing WCAG AA contrast across every light and dark pairing.
- **Layout**: RHYTHM 2 alternates a Royal Blue hero showcase + operational preview card, a full-width live WITA hours strip, a searchable numbered service ledger, an editorial profile split, a featured Kantor Induk + 3-column branch bento grid, and structured contact channels.
- **Typography**: `Plus Jakarta Sans` with `tabular-nums` aligns WITA clocks, section indices (`01` s.d. `07`), and PNBP fee columns cleanly across 360px phones and wide desktops.
- **Spacing**: 4px-aligned fluid section rhythm (`clamp(2.25rem, 5vw, 4.25rem)`) preserves generous breathing room on desktop and tight vertical scanability on mobile.
- **Components**: Native `<details>` service and FAQ accordions preserve full plain-HTML crawlability and zero JS bloat, while native `<dialog>` powers QR code previews and official external tax redirects.
- **Icons & Visuals**: Zero generic stock photos or decorative bloat; SVG placeholders match the Royal Blue token system and clearly invite officer uploads from Admin.
