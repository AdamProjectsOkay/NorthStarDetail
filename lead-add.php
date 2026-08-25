<?php
/* lead-add.php — session-protected. Creates a lead entered by hand in the CRM
   ("New lead" button) and persists it via the shared crm_add_lead() entry point.
   Returns the created lead in the same shape crm-leads.php serves so the
   front-end can drop it straight into state. */
session_start();
header('Content-Type: application/json');

if (empty($_SESSION['crm_auth'])) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Not authenticated']);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

require __DIR__ . '/crm-lib.php';

$name  = trim($_POST['name']  ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');

// Need at least one way to identify / reach the lead.
if ($name === '' && $phone === '' && $email === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Enter a name, phone, or email']);
  exit;
}

$res = crm_add_lead([
  'name'          => mb_substr($name, 0, 200),
  'phone'         => mb_substr($phone, 0, 60),
  'email'         => mb_substr($email, 0, 200),
  'vehicle'       => trim($_POST['vehicle'] ?? ''),   // set directly; no fake inbound thread message is seeded
  'package'       => trim($_POST['package'] ?? ''),
  'preferredDate' => trim($_POST['preferredDate'] ?? ''),
  'address'       => trim($_POST['address'] ?? ''),
  'source'        => trim($_POST['source'] ?? '') !== '' ? mb_substr(trim($_POST['source']), 0, 200) : 'Manual entry',
  'stage'         => $_POST['stage'] ?? 'new',
  'notify'        => false,                            // operator typed this in — no alert email
]);

if (empty($res['ok'])) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Could not save lead']);
  exit;
}

// Return the freshly-stored lead in presentation shape.
$data = crm_load();
$lead = null;
foreach ($data['leads'] as $l) {
  if (($l['id'] ?? '') === $res['id']) { $lead = $l; break; }
}

echo json_encode(['ok' => true, 'id' => $res['id'], 'lead' => $lead ? crm_present($lead) : null]);
