<?php
/* mail-config.example.php — template. Copy to mail-config.php (gitignored)
   and fill in real values.

   Unlike some projects, NONE of the alert-recipient info (who gets emailed
   or texted about a new lead) lives in the PHP source — it all lives here,
   in a file that's gitignored, so no real contact info ever ends up in
   version control (this repo gets handed off to a third party). crm-lib.php
   reads these constants only if this file exists; if it's missing, new-lead
   alerts silently no-op and lead capture itself is unaffected. */

// ---- New-lead alert recipients ----
// Comma-separate LEAD_ALERT_TO/CC to add recipients. Leave a value as ''
// to disable that channel entirely.
define('LEAD_ALERT_TO',   '');   // e.g. 'owner@northstarautodetailing.ca'
define('LEAD_ALERT_CC',   '');
define('LEAD_ALERT_FROM_NAME',  'NorthStar Auto Detailing');
define('LEAD_ALERT_FROM_EMAIL', '');   // should be a real mailbox on your domain (SPF-aligned)

// Owner's phone as a carrier email-to-SMS gateway address, so a new lead also
// lands as a text. Format: <10-digit-number>@<carrier-gateway>. Leave '' to
// disable. Common Canadian gateways:
//   Bell    @txt.bell.ca          Rogers @pcs.rogers.com
//   Telus   @msg.telus.com        Fido   @fido.ca
//   Koodo   @msg.koodomobile.com  Virgin @vmobile.ca
//   Freedom @txt.freedommobile.ca (spotty — many carriers have curtailed these)
// e.g. '7801234567@msg.telus.com'. Best-effort/free, not a guaranteed channel;
// deliverability depends on the carrier still running its gateway.
define('LEAD_ALERT_SMS', '');

// ---- Authenticated SMTP (used to actually send the alert email/SMS) ----
define('SMTP_HOST', '');               // e.g. 'smtp.hostinger.com'
define('SMTP_PORT', 465);              // implicit SSL
define('SMTP_USER', '');               // full mailbox address, e.g. matches LEAD_ALERT_FROM_EMAIL
define('SMTP_PASS', '');               // mailbox password
