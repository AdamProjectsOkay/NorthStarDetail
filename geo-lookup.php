<?php
/* geo-lookup.php — CRM-only IP geolocation proxy. Session-gated.
   Proxies ip-api.com server-side to avoid mixed-content issues. */
session_start();
if (empty($_SESSION['crm_auth'])) {
    http_response_code(403);
    exit;
}

$ip = preg_replace('/[^0-9a-fA-F.:]/', '', $_GET['ip'] ?? '');
header('Content-Type: application/json');

if (!$ip || $ip === '127.0.0.1' || $ip === '::1') {
    echo '{"status":"fail"}';
    exit;
}

$ctx  = stream_context_create(['http' => ['timeout' => 3]]);
$json = @file_get_contents(
    'http://ip-api.com/json/' . rawurlencode($ip) . '?fields=status,city,regionName,country',
    false, $ctx
);
echo $json ?: '{"status":"fail"}';
