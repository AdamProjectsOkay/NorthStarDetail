# NorthStar Auto Detailing — website + lead CRM

Mobile auto-detailing site for NorthStar Auto Detailing (Edmonton & Beaumont,
AB). Zero-build stack: plain PHP (no framework, no npm/bundler) serving
static HTML + React/JSX transpiled client-side via CDN Babel. Leads are
stored in a PHP-guarded JSON file (no database server required), matching
what a small local business can run on cheap shared PHP hosting.

## BEFORE THIS GOES LIVE

**The phone number and business contact info in this repo are placeholders.**
`(780) 555-0100` appears in `index.html`, `app.jsx`, and the JSON-LD
structured data — it is an obviously-fake number and must be replaced with
NorthStar's real phone number (and any real email address) before launch.
Search the repo for `555-0100` / `5550100` to find every occurrence.

## Stack

- **Public site**: `index.html` (hero, lead form, before/after gallery,
  how-it-works, trust strip, footer) + `app.jsx`, `sections.jsx`, `phone.jsx`,
  `icons.jsx`, `admin.jsx`.
- **CRM**: `crm.php` (session-gated shell) + `crm-app.jsx`, `crm-data.jsx`,
  `crm-leaddetail.jsx`. Dashboard, leads table, drag-and-drop pipeline
  (New → Contacted → Scheduled → Completed → Dead), and basic analytics.
  Enter it with `login.php`, or the hidden entry points baked into the
  public site: **Ctrl + 4, 4, 4** on desktop, or tap the footer logo 5 times
  on mobile.
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

4. **Fill in the real phone number.** Replace every occurrence of
   `(780) 555-0100` / `+17805550100` in `index.html` and `app.jsx` with
   NorthStar's real number, and update the `telephone` field in the JSON-LD
   block in `index.html`.

5. **Once a Meta ad account exists**, fill in `meta-config.php` with the real
   Pixel ID, App Secret, Page token, and Conversions API token, then
   uncomment the Meta Pixel `<script>` block near the top of `index.html`
   (search for "REPLACE_WITH_REAL_PIXEL_ID") and paste the same Pixel ID in
   both places. Same idea for Google tag (`REPLACE_WITH_REAL_GA_ID`).

6. **Add real before/after photos.** The gallery section on the homepage
   currently uses styled placeholder cards (no real photos exist yet) —
   see `BeforeAfterGallery` in `sections.jsx`.

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

- **2026-08-24** — v1.0.0: initial CRM + lead-gen backend, ported from a
  sister project's architecture and rebuilt for a mobile detailing business
  (own field set, own copy, before/after gallery instead of a vehicle
  carousel, no financing/credit-application flow).
