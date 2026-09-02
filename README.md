# NorthStar Auto Detailing — website + lead CRM

Mobile auto-detailing site for NorthStar Auto Detailing (Edmonton & Beaumont,
AB). Zero-build stack: plain PHP (no framework, no npm/bundler) serving
static HTML + React/JSX transpiled client-side via CDN Babel. Leads are
stored in a PHP-guarded JSON file (no database server required), matching
what a small local business can run on cheap shared PHP hosting.

The public site (real copy, real pricing, real phone number, real
before/after photos) predates the CRM and was originally built and exported
as a self-contained design artifact. It's since been unpacked into normal
per-component files (`header.jsx`, `hero.jsx`, etc.) so it lives in the same
plain-file style as the CRM, and its booking form — which previously only
showed a local "thanks" message — now actually submits into the CRM via
`lead-submit.php`.

## Stack

- **Public site**: `index.html` (design tokens, Header, Hero, PricingGrid,
  AddOns, ResultsGallery, BookingForm, MobileServiceBand, Footer) +
  `header.jsx`, `hero.jsx`, `pricing.jsx`, `addons.jsx`, `gallery.jsx`,
  `booking.jsx`, `service-area.jsx`, `footer.jsx`, `admin.jsx`. Real photos
  live in `images/`.
- **CRM**: `crm.php` (session-gated shell) + `crm-app.jsx`, `crm-data.jsx`,
  `crm-leaddetail.jsx`, `icons.jsx`. Dashboard, leads table, drag-and-drop
  pipeline (New → Contacted → Scheduled → Completed → Dead), and basic
  analytics. Enter it with `login.php`, or the hidden entry points baked
  into the public site: **Ctrl + 4, 4, 4** on desktop (`admin.jsx`), or tap
  the "We come to you." headline 4 times on mobile (`service-area.jsx`).
- **Backend/data**: `crm-lib.php` (JSON store + locking + lead helpers),
  `crm-leads.php` / `lead-add.php` / `lead-submit.php` / `lead-update.php`
  (API endpoints).
- **Ads/tracking**: `track.php` + `track-events.php` / `track-visits.php` /
  `event-lib.php` / `visit-lib.php` / `geo-lookup.php` (anonymous visit +
  UTM/referrer attribution, no PII), `meta-lib.php` / `meta-webhook.php`
  (Meta Conversions API + Lead Ads webhook), `inbound-lead.php` (generic
  Zapier/Make ingestion for other lead sources).

## Setup

1. **Copy the config templates and fill in real values.** These three files
   are gitignored — copies with real values must never be committed:

   ```
   cp crm-auth.example.php   crm-auth.php
   cp mail-config.example.php mail-config.php
   cp meta-config.example.php meta-config.php
   ```

2. **Create a CRM login.** Generate a bcrypt hash and paste it into
   `crm-auth.php`:

   ```
   php -r "echo password_hash('THE_PASSWORD', PASSWORD_DEFAULT);"
   ```

3. **Set up new-lead alerts (optional but recommended).** Fill in
   `mail-config.php` with the mailbox NorthStar wants alerts sent from/to
   (SMTP host/user/pass, alert recipient email, and optionally a carrier
   email-to-SMS gateway address so a new lead also lands as a text). If this
   file is left blank or missing, lead capture still works fine — new leads
   just won't trigger an email/SMS alert.

4. **Phone number is already real** (780-781-5615, used throughout
   `index.html` and the component files) — no placeholder to swap.

5. **Once a Meta ad account exists**, fill in `meta-config.php` with the real
   Pixel ID, App Secret, Page token, and Conversions API token, then
   uncomment the Meta Pixel `<script>` block near the top of `index.html`
   (search for "REPLACE_WITH_REAL_PIXEL_ID") and paste the same Pixel ID in
   both places. Same idea for Google tag (`REPLACE_WITH_REAL_GA_ID`).

6. **Gallery already has real before/after photos** (`images/`) — add more
   over time by following the pattern in `gallery.jsx`.

7. **Upload everything to any PHP host** (shared hosting is fine — no
   database, no build step, no Node required). Make sure the real
   `crm-auth.php` / `mail-config.php` / `meta-config.php` files exist on the
   server (they're gitignored, so they don't come from git — copy them up
   separately, e.g. via SFTP).

## Notes on the CRM's field set

Unlike a vehicle-sales CRM, there's no financing/credit concept here. Each
lead carries: **vehicle** (what's being detailed), **service package**,
**preferred date**, and **service address** (since this is a mobile
business — the crew goes to the customer). These are optional facts an
operator fills in via the lead drawer as they text back and forth with a
customer; the public form only collects name/phone/email and a free-text
"what do you need" field, matching how little friction the original design
intentionally puts in front of a visitor.

Pipeline stages: **New → Contacted → Scheduled → Completed → Dead**.

## Changelog

- **2026-09-01** — v1.0.1: the CRM/backend commit below had replaced the
  real, previously-designed public site with a from-scratch rebuild
  (placeholder phone number, no real photos, booking form never wired to
  a backend). Restored the real site — unpacked from its original
  self-contained export into per-component files — and wired its booking
  form into `lead-submit.php` so it actually captures leads. `lead-submit.php`
  now also accepts optional `vehicle`/`package`/`address` fields and no
  longer requires an email (the real form doesn't collect one).
- **2026-08-24** — v1.0.0: initial CRM + lead-gen backend, ported from a
  sister project's architecture and rebuilt for a mobile detailing business
  (own field set, own copy, before/after gallery instead of a vehicle
  carousel, no financing/credit-application flow).
