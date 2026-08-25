<?php
/* track.php — public analytics receiver. No auth needed; only
   anonymous visit metadata is written (no contact info, no PII). */
require_once __DIR__ . '/visit-lib.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo '{"ok":false}';
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];
if (!$data) { echo '{"ok":true}'; exit; }

// Detect CRM staff so their visits can be excluded from public analytics.
session_start();
$isCrm = !empty($_SESSION['crm_auth']) ? 1 : 0;

if (($data['action'] ?? '') === 'duration') {
    $id  = substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['id'] ?? ''), 0, 40);
    $dur = min(max(0, intval($data['duration'] ?? 0)), 86400);
    visit_update_duration($id, $dur);
} elseif (($data['action'] ?? '') === 'event') {
    // Anonymous interaction event (e.g. before/after gallery click/scroll).
    require_once __DIR__ . '/event-lib.php';
    $kind = substr(preg_replace('/[^a-z_]/', '', $data['kind'] ?? ''), 0, 40);
    if ($kind !== '') {
        event_add([
            'kind' => $kind,
            'meta' => substr(preg_replace('/[^a-zA-Z0-9_-]/', '', $data['meta'] ?? ''), 0, 40),
            'vid'  => substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['vid'] ?? ''), 0, 40),
            'ts'   => intval($data['ts'] ?? 0) ?: (time() * 1000),
            'crm'  => $isCrm,
        ]);
    }
} else {
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    $ip  = $xff ? trim(explode(',', $xff)[0]) : ($_SERVER['REMOTE_ADDR'] ?? '');
    visit_add([
        'id'       => substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['id']  ?? ''), 0, 40),
        'vid'      => substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['vid'] ?? ''), 0, 40),
        'ip'       => substr(preg_replace('/[^0-9a-fA-F.:]/', '', $ip), 0, 45),
        'ts'       => intval($data['ts'] ?? 0) ?: (time() * 1000),
        'url'      => substr($data['url'] ?? '', 0, 512),
        'ref'      => substr($data['ref'] ?? '', 0, 256),
        'source'   => substr($data['source'] ?? 'Direct', 0, 64),
        'medium'   => substr($data['medium'] ?? '', 0, 64),
        'campaign' => substr($data['campaign'] ?? '', 0, 128),
        'content'  => substr($data['content'] ?? '', 0, 128),
        'term'     => substr($data['term'] ?? '', 0, 128),
        'duration' => 0,
        'crm'      => $isCrm,
    ]);
}

echo '{"ok":true}';
