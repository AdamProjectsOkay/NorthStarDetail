<?php
/* meta-webhook.php — callback URL for Meta Lead Ads.
   GET  = Meta's verification handshake (echoes hub.challenge).
   POST = signed leadgen notification; we fetch the lead via Graph and
          store it. Configure the callback URL in your Meta app as:
          https://northstarautodetailing.ca/meta-webhook.php  (with the
          verify token from meta-config.php). */

require __DIR__ . '/meta-config.php';
require __DIR__ . '/meta-lib.php';

/* ---- 1. Verification handshake (Meta sends GET with hub.* params;
        PHP turns the dots into underscores in $_GET) ---- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $mode      = $_GET['hub_mode']         ?? '';
  $token     = $_GET['hub_verify_token'] ?? '';
  $challenge = $_GET['hub_challenge']    ?? '';
  if ($mode === 'subscribe' && META_VERIFY_TOKEN !== '' && hash_equals(META_VERIFY_TOKEN, $token)) {
    header('Content-Type: text/plain');
    echo $challenge;          // Meta expects the raw challenge echoed back
    exit;
  }
  http_response_code(403);
  echo 'Verification failed';
  exit;
}

/* ---- 2. Lead notifications (POST) ---- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit;
}

$raw = file_get_contents('php://input');

// Verify the payload signature against the app secret before trusting anything.
$sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
if (META_APP_SECRET === '' || $sig === '') {
  http_response_code(403);
  meta_log('rejected: missing app secret or signature header');
  exit;
}
$expected = 'sha256=' . hash_hmac('sha256', $raw, META_APP_SECRET);
if (!hash_equals($expected, $sig)) {
  http_response_code(403);
  meta_log('rejected: bad signature');
  exit;
}

// Acknowledge immediately, then process (Graph fetches happen after the ack).
http_response_code(200);
echo 'EVENT_RECEIVED';
if (function_exists('fastcgi_finish_request')) { fastcgi_finish_request(); }

$payload = json_decode($raw, true);
if (!is_array($payload) || ($payload['object'] ?? '') !== 'page') {
  meta_log('ignored non-page object');
  exit;
}

foreach ($payload['entry'] ?? [] as $entry) {
  foreach ($entry['changes'] ?? [] as $change) {
    if (($change['field'] ?? '') !== 'leadgen') continue;
    $v = $change['value'] ?? [];
    meta_ingest_lead($v['leadgen_id'] ?? '', $v);
  }
}
exit;
