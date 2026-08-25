<?php
/* event-lib.php — shared helpers for the interaction-event store
   (e.g. before/after gallery clicks & scrolls). event-store.php is
   PHP-guarded (returns 403 on direct HTTP fetch) so raw event data
   can't be scraped from the web root. Mirrors visit-lib.php. */

define('EVENT_STORE', __DIR__ . '/event-store.php');
define('EVENT_GUARD', "<?php http_response_code(403); die('Forbidden'); ?>\n");
define('EVENT_MAX', 20000);

function event_load() {
    if (!is_file(EVENT_STORE)) return [];
    $raw = file_get_contents(EVENT_STORE);
    if ($raw === false) return [];
    $nl   = strpos($raw, "\n");
    $json = ($nl === false) ? '' : substr($raw, $nl + 1);
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function event_save(array $events) {
    if (count($events) > EVENT_MAX) {
        $events = array_slice($events, -EVENT_MAX);
    }
    file_put_contents(EVENT_STORE, EVENT_GUARD . json_encode($events), LOCK_EX);
}

function event_add(array $e) {
    $fp = fopen(EVENT_STORE . '.lock', 'c');
    if ($fp) flock($fp, LOCK_EX);

    $events   = event_load();
    $events[] = $e;
    event_save($events);

    if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
}
