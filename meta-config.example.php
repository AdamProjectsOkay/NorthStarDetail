<?php
/* meta-config.example.php — template. Copy to meta-config.php (gitignored)
   and fill in once a Meta ad account exists for this business. This file is
   PHP so it is never served as source over HTTP. Every value below defaults
   to '' — every code path that reads these constants checks for a blank
   value first and silently no-ops, so lead capture and the rest of the site
   work fine with no ad account configured yet. */

// Meta app → Settings → Basic → App secret:
define('META_APP_SECRET', '');

// You choose this; paste the SAME value into the Meta webhook config:
define('META_VERIFY_TOKEN', 'CHOOSE_A_RANDOM_STRING');

// Long-lived Page (or System User) token with leads_retrieval:
define('META_PAGE_TOKEN', '');

// Graph API version:
define('META_GRAPH_VER', 'v21.0');

// Conversions API (server-side events) — Events Manager → your pixel →
// Settings → Conversions API → "Set up manually" → Generate access token:
define('META_CAPI_TOKEN', '');

// Pixel ID the client-side fbq('init', ...) uses (see index.html) — CAPI
// events must be sent to the same pixel to dedup/match correctly:
define('META_PIXEL_ID', '');

// Optional: paste the code from Events Manager → Test Events while
// verifying setup, then blank it out once real events show up as expected:
define('META_TEST_EVENT_CODE', '');

// Shared secret for the connector inbound endpoint (Make/Zapier):
define('INBOUND_KEY', 'CHOOSE_A_RANDOM_STRING');
