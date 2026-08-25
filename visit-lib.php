<?php
/* visit-lib.php — shared helpers for the visit analytics store.
   visit-store.php is PHP-guarded (returns 403 on direct HTTP fetch)
   so raw visit data can't be scraped from the web root. */

define('VISIT_STORE', __DIR__ . '/visit-store.php');
define('VISIT_GUARD', "<?php http_response_code(403); die('Forbidden'); ?>\n");
define('VISIT_MAX', 10000);

function visit_load() {
    if (!is_file(VISIT_STORE)) return [];
    $raw = file_get_contents(VISIT_STORE);
    if ($raw === false) return [];
    $nl   = strpos($raw, "\n");
    $json = ($nl === false) ? '' : substr($raw, $nl + 1);
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function visit_save(array $visits) {
    if (count($visits) > VISIT_MAX) {
        $visits = array_slice($visits, -VISIT_MAX);
    }
    file_put_contents(VISIT_STORE, VISIT_GUARD . json_encode($visits), LOCK_EX);
}

function visit_add(array $v) {
    $fp = fopen(VISIT_STORE . '.lock', 'c');
    if ($fp) flock($fp, LOCK_EX);

    $visits = visit_load();
    foreach ($visits as $existing) {
        if ($existing['id'] === $v['id']) {
            if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
            return;
        }
    }
    $visits[] = $v;
    visit_save($visits);

    if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
}

function visit_update_duration(string $id, int $dur) {
    if ($id === '' || $dur <= 0) return;
    $fp = fopen(VISIT_STORE . '.lock', 'c');
    if ($fp) flock($fp, LOCK_EX);

    $visits  = visit_load();
    $changed = false;
    foreach ($visits as &$v) {
        if ($v['id'] === $id) { $v['duration'] = $dur; $changed = true; break; }
    }
    unset($v);
    if ($changed) visit_save($visits);

    if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
}
