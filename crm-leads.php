<?php
/* crm-leads.php — session-protected feed of leads for the CRM front-end.
   Requires a valid CRM session (same gate as crm.php). */
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

if (empty($_SESSION['crm_auth'])) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Not authenticated']);
  exit;
}

require __DIR__ . '/crm-lib.php';
$data  = crm_load();
$leads = array_map('crm_present', $data['leads']);

// derive a small live activity feed from the most recent leads
$activity = [];
foreach (array_slice($data['leads'], 0, 8) as $l) {
  $activity[] = [
    'who'    => null,
    'icon'   => 'spark',
    'text'   => 'New lead from ' . ($l['source'] ?? 'Website'),
    'detail' => $l['name'],
    'time'   => crm_rel_time($l['ts'] ?? time()),
  ];
}

echo json_encode(['ok' => true, 'leads' => $leads, 'activity' => $activity]);
