<?php
/* inbound-lead.php — receives leads from a connector (Make.com / Zapier)
   wired to Meta Lead Ads. Auth is a shared secret (INBOUND_KEY) sent
   either as the "X-Api-Key" header or a "key" field. Accepts form-encoded
   or JSON bodies, and is tolerant of whatever field names the connector
   maps in — standard name/phone/email are recognized, everything else is
   folded into the lead's first conversation message. */
require __DIR__ . '/meta-config.php';
require __DIR__ . '/crm-lib.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

// Accept JSON or form-encoded
$in = $_POST;
if (empty($in)) {
  $raw = file_get_contents('php://input');
  $j = json_decode($raw, true);
  if (is_array($j)) $in = $j;
}

// Auth
$key = $_SERVER['HTTP_X_API_KEY'] ?? ($in['key'] ?? '');
if (!defined('INBOUND_KEY') || INBOUND_KEY === '' || !hash_equals(INBOUND_KEY, (string) $key)) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
  exit;
}

// Normalize keys to lowercase for flexible matching
$map = [];
foreach ($in as $k => $v) {
  if (is_array($v)) $v = implode(', ', $v);
  $map[strtolower(trim($k))] = is_string($v) ? trim($v) : $v;
}

$name  = $map['full_name'] ?? ($map['name'] ?? trim(($map['first_name'] ?? '') . ' ' . ($map['last_name'] ?? '')));
$phone = $map['phone_number'] ?? ($map['phone'] ?? ($map['mobile'] ?? ''));
$email = $map['email'] ?? ($map['email_address'] ?? '');

// Fold any other answers into the lead's first message so nothing is lost
$known = ['key', 'source', 'lead_id', 'leadgen_id', 'created_time',
          'full_name', 'name', 'first_name', 'last_name',
          'phone_number', 'phone', 'mobile', 'email', 'email_address'];
$extra = [];
foreach ($map as $k => $v) {
  if (in_array($k, $known, true) || $v === '' || !is_string($v)) continue;
  $extra[] = ucwords(str_replace('_', ' ', $k)) . ': ' . $v;
}

if (trim($name) === '' && $phone === '' && $email === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'No name, phone, or email provided']);
  exit;
}

$created = $map['created_time'] ?? '';
$ts = is_numeric($created) ? (int) $created : (strtotime((string) $created) ?: time());

$res = crm_add_lead([
  'name'   => $name !== '' ? mb_substr($name, 0, 120) : 'Facebook lead',
  'phone'  => mb_substr((string) $phone, 0, 40),
  'email'  => mb_substr((string) $email, 0, 160),
  'want'   => mb_substr(implode("\n", $extra), 0, 2000),
  'source' => $map['source'] ?? 'Facebook',
  'extId'  => (string) ($map['leadgen_id'] ?? ($map['lead_id'] ?? '')),
  'ts'     => $ts,
]);

echo json_encode(['ok' => true, 'id' => $res['id'] ?? null, 'dedup' => $res['dedup'] ?? false]);
