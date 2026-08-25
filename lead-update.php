<?php
/* lead-update.php — session-protected. Applies an edit to one lead
   (stage change, internal note, logged call, or an outbound message)
   and persists it to the store. */
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

$id     = trim($_POST['id'] ?? '');
$action = $_POST['action'] ?? '';
if ($id === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Missing id']);
  exit;
}

$fp = fopen(CRM_STORE . '.lock', 'c');
if ($fp) { flock($fp, LOCK_EX); }

$data = crm_load();
$idx = null;
foreach ($data['leads'] as $i => $l) {
  if (($l['id'] ?? '') === $id) { $idx = $i; break; }
}
if ($idx === null) {
  if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
  http_response_code(404);
  echo json_encode(['ok' => false, 'error' => 'Lead not found']);
  exit;
}

$lead =& $data['leads'][$idx];
$now  = time();
$err  = '';

switch ($action) {
  case 'stage':
    $stage = $_POST['stage'] ?? '';
    $valid = ['new', 'contacted', 'scheduled', 'completed', 'dead'];
    if (!in_array($stage, $valid, true)) { $err = 'Invalid stage'; break; }
    $lead['stage'] = $stage;
    break;

  case 'note':
    $text = trim($_POST['text'] ?? '');
    if ($text === '') { $err = 'Empty note'; break; }
    if (!isset($lead['notes']) || !is_array($lead['notes'])) $lead['notes'] = [];
    $lead['notes'][] = ['by' => 'owner', 'text' => mb_substr($text, 0, 2000), 'ts' => $now];
    break;

  case 'message':
    $text = trim($_POST['text'] ?? '');
    $ch   = (($_POST['ch'] ?? 'sms') === 'email') ? 'email' : 'sms';
    if ($text === '') { $err = 'Empty message'; break; }
    if (!isset($lead['thread']) || !is_array($lead['thread'])) $lead['thread'] = [];
    $lead['thread'][] = ['dir' => 'out', 'ch' => $ch, 'text' => mb_substr($text, 0, 4000), 'ts' => $now];
    $lead['lastAttemptTs'] = $now;
    break;

  case 'fields':
    $allowed = ['vehicle', 'package', 'preferredDate', 'address', 'source'];
    foreach ($allowed as $f) {
      if (!array_key_exists($f, $_POST)) continue;
      $lead[$f] = mb_substr(trim((string)$_POST[$f]), 0, 500);
    }
    break;

  case 'followup':
    $date = trim($_POST['date'] ?? '');
    if ($date === '') {
      unset($lead['followUp']);                 // empty date clears the reminder
    } else {
      if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) { $err = 'Invalid date'; break; }
      $lead['followUp'] = [
        'date' => $date,
        'note' => mb_substr(trim($_POST['note'] ?? ''), 0, 1000),
      ];
    }
    break;

  case 'delete':
    array_splice($data['leads'], $idx, 1);
    crm_save($data);
    if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
    echo json_encode(['ok' => true]);
    exit;

  default:
    $err = 'Unknown action';
}

if ($err !== '') {
  if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => $err]);
  exit;
}

crm_save($data);
if ($fp) { flock($fp, LOCK_UN); fclose($fp); }

echo json_encode(['ok' => true, 'lead' => crm_present($lead)]);
