<?php
/* meta-lib.php — helpers for Meta (Facebook/Instagram) Lead Ads.
   Pure functions + Graph API fetch; no side effects on include so the
   mapping can be unit-tested. Request handling lives in meta-webhook.php. */

require_once __DIR__ . '/crm-lib.php';

/* Append a line to a PHP-guarded log (direct HTTP fetch returns nothing,
   because the guard's die() halts before the appended lines are reached). */
function meta_log($msg) {
  $f = __DIR__ . '/meta-webhook-log.php';
  if (!file_exists($f)) { file_put_contents($f, CRM_STORE_GUARD, LOCK_EX); }
  file_put_contents($f, '[' . date('c') . '] ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

/* GET a URL, preferring cURL, falling back to streams. Returns body string or null. */
function meta_http_get($url) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT        => 15,
      CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($body === false || $code >= 400) { meta_log("graph GET $code $err"); return null; }
    return $body;
  }
  $ctx  = stream_context_create(['http' => ['timeout' => 15, 'ignore_errors' => true]]);
  $body = @file_get_contents($url, false, $ctx);
  return $body === false ? null : $body;
}

/* Turn a Graph API leadgen response into our crm_add_lead() input.
   Robust to whatever the form's fields are called: it recognizes the
   standard name/phone/email keys and folds every other answer into the
   lead's first conversation message so nothing is lost. */
function meta_build_lead($graphLead, $leadgenId) {
  $map = [];
  foreach (($graphLead['field_data'] ?? []) as $f) {
    $k = strtolower($f['name'] ?? '');
    $v = isset($f['values'][0]) ? $f['values'][0] : '';
    if ($k !== '') $map[$k] = $v;
  }

  $name = $map['full_name'] ?? trim(($map['first_name'] ?? '') . ' ' . ($map['last_name'] ?? ''));
  $phone = $map['phone_number'] ?? ($map['phone'] ?? ($map['mobile'] ?? ''));
  $email = $map['email'] ?? ($map['email_address'] ?? '');

  $known = ['full_name', 'first_name', 'last_name', 'phone_number', 'phone', 'mobile', 'email', 'email_address'];
  $extra = [];
  foreach ($map as $k => $v) {
    if (in_array($k, $known, true) || $v === '') continue;
    $extra[] = ucwords(str_replace('_', ' ', $k)) . ': ' . $v;
  }

  $created = $graphLead['created_time'] ?? '';
  $ts = is_numeric($created) ? (int) $created : (strtotime((string) $created) ?: time());

  return [
    'name'   => $name !== '' ? $name : 'Facebook lead',
    'phone'  => $phone,
    'email'  => $email,
    'want'   => implode("\n", $extra),
    'source' => 'Facebook',
    'extId'  => $leadgenId,
    'ts'     => $ts,
  ];
}

/* Digits-only phone with country code, per Meta's CAPI hashing spec.
   Assumes North American numbers when no country code is present. */
function meta_capi_normalize_phone($phone) {
  $d = preg_replace('/\D+/', '', (string) $phone);
  if (strlen($d) === 10) $d = '1' . $d;
  return $d;
}

/* Send one Lead event to the Meta Conversions API. Silently no-ops if the
   CAPI token/pixel isn't configured, so a blank meta-config.php never
   breaks lead capture — only the (already-working) browser Pixel event is
   lost. $eventId should match the fbq('track','Lead', ..., {eventID}) call
   made in the browser so Meta dedups the two into one event. */
function meta_capi_send_lead($opts) {
  if (!defined('META_CAPI_TOKEN') || META_CAPI_TOKEN === '') return;
  if (!defined('META_PIXEL_ID') || META_PIXEL_ID === '') return;
  if (!function_exists('curl_init')) { meta_log('capi: curl unavailable'); return; }

  $userData = [];
  if (!empty($opts['email'])) $userData['em'] = [hash('sha256', strtolower(trim($opts['email'])))];
  if (!empty($opts['phone'])) $userData['ph'] = [hash('sha256', meta_capi_normalize_phone($opts['phone']))];
  if (!empty($opts['ip']))    $userData['client_ip_address'] = $opts['ip'];
  if (!empty($opts['ua']))    $userData['client_user_agent'] = $opts['ua'];
  if (!empty($opts['fbp']))   $userData['fbp'] = $opts['fbp'];
  if (!empty($opts['fbc']))   $userData['fbc'] = $opts['fbc'];

  $event = [
    'event_name'       => 'Lead',
    'event_time'       => time(),
    'action_source'    => 'website',
    'event_source_url' => $opts['url'] ?? 'https://northstarautodetailing.ca/',
    'user_data'        => $userData,
  ];
  if (!empty($opts['eventId'])) $event['event_id'] = $opts['eventId'];

  $body = ['data' => [$event]];
  if (defined('META_TEST_EVENT_CODE') && META_TEST_EVENT_CODE !== '') {
    $body['test_event_code'] = META_TEST_EVENT_CODE;
  }

  $url = 'https://graph.facebook.com/' . META_GRAPH_VER . '/' . META_PIXEL_ID
       . '/events?access_token=' . urlencode(META_CAPI_TOKEN);
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($body),
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
  ]);
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err  = curl_error($ch);
  curl_close($ch);

  if ($code >= 400 || $resp === false) {
    meta_log("capi send failed $code $err: " . substr((string) $resp, 0, 300));
  } else {
    meta_log("capi Lead sent" . (!empty($opts['eventId']) ? " event_id={$opts['eventId']}" : ''));
  }
}

/* Fetch one lead from Graph by leadgen_id and store it. */
function meta_ingest_lead($leadgenId, $changeValue) {
  if ($leadgenId === '') return;
  $url = 'https://graph.facebook.com/' . META_GRAPH_VER . '/' . urlencode($leadgenId)
       . '?fields=' . urlencode('field_data,created_time,ad_id,form_id,campaign_name,ad_name')
       . '&access_token=' . urlencode(META_PAGE_TOKEN);

  $resp = meta_http_get($url);
  if ($resp === null) { meta_log("fetch failed for leadgen_id=$leadgenId"); return; }

  $graphLead = json_decode($resp, true);
  if (!is_array($graphLead) || isset($graphLead['error'])) {
    meta_log("graph error for $leadgenId: " . substr($resp, 0, 300));
    return;
  }

  $res = crm_add_lead(meta_build_lead($graphLead, $leadgenId));
  meta_log("ingested leadgen_id=$leadgenId -> " . ($res['id'] ?? '?') . (($res['dedup'] ?? false) ? ' (dedup)' : ''));
}
