<?php
/* track-events.php — session-gated; returns all stored interaction
   events (gallery clicks/scrolls) for the Analytics page in the CRM. */
session_start();
if (empty($_SESSION['crm_auth'])) {
    http_response_code(403);
    echo '{"error":"Unauthorized"}';
    exit;
}

require_once __DIR__ . '/event-lib.php';
header('Content-Type: application/json');

echo json_encode(array_reverse(event_load())); // newest first
