<?php
/* lead-submit.php — public endpoint the landing-page form POSTs to.
   Validates server-side, then appends a new lead to the store. */
require __DIR__ . '/crm-lib.php';
if (file_exists(__DIR__ . '/meta-config.php')) require_once __DIR__ . '/meta-config.php';
require_once __DIR__ . '/meta-lib.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$name  = trim($_POST['name']  ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$want  = trim($_POST['want']  ?? '');
$digits = preg_replace('/\D+/', '', $phone);

// Attribution the tracking script resolved this visit to (see index.html),
// e.g. "Facebook"/"Google Ads"/"Direct" — falls back to the old generic
// label only if JS attribution didn't come through (blocked/old cache).
$srcClean = substr(preg_replace('/[^a-zA-Z0-9 ._-]/', '', trim($_POST['source'] ?? '')), 0, 64);
$source   = $srcClean !== '' ? $srcClean : 'Website form';

// Meta click-identity cookies. Prefer what the browser read and posted (see
// app.jsx) since it can reconstruct _fbc from a live fbclid even when a
// blocker prevented fbevents.js from ever setting the cookie; fall back to
// reading the cookies directly for cached JS that predates this.
$fbp = substr(preg_replace('/[^a-zA-Z0-9_.]/', '', trim($_POST['fbp'] ?? '')), 0, 200);
$fbc = substr(preg_replace('/[^a-zA-Z0-9_.]/', '', trim($_POST['fbc'] ?? '')), 0, 200);
if ($fbp === '') $fbp = $_COOKIE['_fbp'] ?? '';
if ($fbc === '') $fbc = $_COOKIE['_fbc'] ?? '';

$err = '';
if ($name === '' || mb_strlen($name) > 120)         $err = 'Please enter your name.';
elseif (strlen($digits) < 10)                        $err = 'Please enter a valid phone number.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))  $err = 'Please enter a valid email.';

if ($err !== '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => $err]);
  exit;
}

$name  = mb_substr($name, 0, 120);
$email = mb_substr($email, 0, 160);
$phone = mb_substr($phone, 0, 40);
$want  = mb_substr($want, 0, 2000);

// crm_add_lead handles its own locking/sequencing/de-dup
crm_add_lead([
  'name'   => $name,
  'phone'  => $phone,
  'email'  => $email,
  'want'   => $want,
  'source' => $source,
  'ip'     => $_SERVER['REMOTE_ADDR'] ?? '',
  'fbp'    => $fbp,
  'fbc'    => $fbc,
]);

echo json_encode(['ok' => true]);

// Respond before the (slower) outbound call to Meta so it never adds
// latency to the user's submit; matches the event_id the browser Pixel
// tags its fbq('track','Lead', ...) call with, so Meta dedups the two.
if (function_exists('fastcgi_finish_request')) { fastcgi_finish_request(); }
meta_capi_send_lead([
  'email'   => $email,
  'phone'   => $phone,
  'ip'      => $_SERVER['REMOTE_ADDR'] ?? '',
  'ua'      => $_SERVER['HTTP_USER_AGENT'] ?? '',
  'fbp'     => $fbp,
  'fbc'     => $fbc,
  'url'     => $_SERVER['HTTP_REFERER'] ?? 'https://northstarautodetailing.ca/',
  'eventId' => substr(preg_replace('/[^a-zA-Z0-9_.-]/', '', $_POST['event_id'] ?? ''), 0, 64),
]);
