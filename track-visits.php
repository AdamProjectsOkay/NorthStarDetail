<?php
/* track-visits.php — session-gated; returns all stored visits for
   the Analytics page in the CRM. */
session_start();
if (empty($_SESSION['crm_auth'])) {
    http_response_code(403);
    echo '{"error":"Unauthorized"}';
    exit;
}

require_once __DIR__ . '/visit-lib.php';
header('Content-Type: application/json');

$visits = array_reverse(visit_load()); // newest first
echo json_encode($visits);
