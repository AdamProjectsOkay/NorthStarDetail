<?php
/* crm-lib.php — shared storage + helpers for the NorthStar CRM leads.
   Leads live in crm-store.php: a PHP-guarded JSON file that returns
   403 (and prints nothing) if fetched directly over HTTP, so customer
   contact info can't be scraped even though it sits in the web root. */

define('CRM_STORE', __DIR__ . '/crm-store.php');
define('CRM_STORE_GUARD', "<?php http_response_code(403); die('Forbidden'); ?>\n");

/* ---- New-lead email/SMS alerts ----
   Who gets pinged the moment a lead lands (any source) lives entirely in
   mail-config.php, which is gitignored — never hardcoded here. If that file
   is absent (e.g. a fresh checkout of this repo), the constants below are
   simply undefined and crm_notify_new_lead()/crm_smtp_send() no-op, so lead
   capture itself is never affected by missing mail config. See
   mail-config.example.php for the template. */
if (is_file(__DIR__ . '/mail-config.php')) require_once __DIR__ . '/mail-config.php';

function crm_load() {
  $empty = ['seq' => 1000, 'leads' => []];
  if (!is_file(CRM_STORE)) return $empty;
  $raw = file_get_contents(CRM_STORE);
  if ($raw === false) return $empty;
  $nl = strpos($raw, "\n");
  $json = ($nl === false) ? '' : substr($raw, $nl + 1);
  $data = json_decode($json, true);
  if (!is_array($data)) return $empty;
  if (!isset($data['seq'])) $data['seq'] = 1000;
  if (!isset($data['leads']) || !is_array($data['leads'])) $data['leads'] = [];
  return $data;
}

function crm_save($data) {
  $out = CRM_STORE_GUARD . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  file_put_contents(CRM_STORE, $out, LOCK_EX);
}

/* crm_add_lead — single entry point for creating a lead from any source
   (website form, Meta Lead Ads, etc.). Handles locking, sequencing, and
   de-duplication by external id (e.g. Meta leadgen_id, which can arrive
   more than once because Meta retries webhooks).
   $in keys: name, phone, email, want, source, extId (optional), ts (optional), ip (optional). */
function crm_add_lead($in) {
  $fp = fopen(CRM_STORE . '.lock', 'c');
  if ($fp) { flock($fp, LOCK_EX); }

  $data  = crm_load();
  $extId = trim($in['extId'] ?? '');

  if ($extId !== '') {
    foreach ($data['leads'] as $l) {
      if (($l['extId'] ?? '') === $extId) {        // already ingested — no-op
        if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
        return ['ok' => true, 'dedup' => true, 'id' => $l['id']];
      }
    }
  }

  $data['seq'] = (int) $data['seq'] + 1;
  $ts   = isset($in['ts']) ? (int) $in['ts'] : time();
  $want = trim($in['want'] ?? '');
  $thread = [];
  if ($want !== '') {
    $thread[] = ['dir' => 'in', 'ch' => 'sms', 'text' => $want, 'ts' => $ts];
  }

  $validStages = ['new', 'contacted', 'scheduled', 'completed', 'dead'];
  $stage = (isset($in['stage']) && in_array($in['stage'], $validStages, true)) ? $in['stage'] : 'new';

  $lead = [
    'id'     => 'L-' . $data['seq'],
    'name'   => $in['name'] ?? '',
    'phone'  => $in['phone'] ?? '',
    'email'  => $in['email'] ?? '',
    'want'   => $want,
    'source' => $in['source'] ?? 'Website form',
    'stage'  => $stage,
    'ts'     => $ts,
    'ip'     => $in['ip'] ?? '',
    'extId'  => $extId,
    'notes'  => [],
    'thread' => $thread,
  ];

  // Optional job facts an operator can supply when entering a lead by hand.
  // (Website/Meta leads omit these and fill them in later via the drawer,
  // once the operator has texted back and forth with the customer.)
  if (isset($in['vehicle'])       && trim($in['vehicle'])       !== '') $lead['vehicle']       = mb_substr(trim($in['vehicle']), 0, 500);
  if (isset($in['package'])       && trim($in['package'])       !== '') $lead['package']       = mb_substr(trim($in['package']), 0, 500);
  if (isset($in['preferredDate']) && trim($in['preferredDate']) !== '') $lead['preferredDate'] = mb_substr(trim($in['preferredDate']), 0, 200);
  if (isset($in['address'])       && trim($in['address'])       !== '') $lead['address']       = mb_substr(trim($in['address']), 0, 500);

  // Meta click-identity cookies (_fbp/_fbc), captured at submit time so a
  // later CAPI event for this lead (e.g. a down-funnel stage change) can
  // still match the original ad click.
  if (isset($in['fbp']) && trim($in['fbp']) !== '') $lead['fbp'] = mb_substr(trim($in['fbp']), 0, 200);
  if (isset($in['fbc']) && trim($in['fbc']) !== '') $lead['fbc'] = mb_substr(trim($in['fbc']), 0, 200);

  array_unshift($data['leads'], $lead);   // newest first
  crm_save($data);

  if ($fp) { flock($fp, LOCK_UN); fclose($fp); }   // release lock before mailing

  // Manual entries (notify === false) skip the alert email — the operator who
  // typed it in doesn't need to be emailed about their own data entry.
  if (($in['notify'] ?? true) !== false) crm_notify_new_lead($lead);   // best-effort; never blocks the save
  return ['ok' => true, 'id' => $lead['id']];
}

/* crm_notify_new_lead — email an alert to the owner(s) the instant a new
   lead is stored. Fires only for genuinely new leads (the de-dup path above
   returns early), and is wrapped so any mail failure is silently swallowed —
   a lead must always save even if the mail server hiccups. Reply-To is set
   to the customer so the owner can reply straight to them from their phone.
   No-ops entirely if mail-config.php hasn't been set up (LEAD_ALERT_TO is
   undefined or blank), which is the default state of a fresh checkout. */
function crm_notify_new_lead($lead) {
  if (!defined('LEAD_ALERT_TO') || LEAD_ALERT_TO === '') return;

  $name   = $lead['name']  !== '' ? $lead['name']  : '(no name)';
  $phone  = $lead['phone'] !== '' ? $lead['phone'] : '(no phone)';
  $email  = trim($lead['email'] ?? '');
  $want   = trim($lead['want'] ?? '');
  $source = $lead['source'] ?? 'Website form';
  $when   = date('M j, Y g:i A T', $lead['ts'] ?? time());

  // Subject is base64 MIME-encoded so accented names / symbols can't break it.
  $subject = 'New NorthStar lead: ' . $name . ' (' . $phone . ')';
  $subjOut = '=?UTF-8?B?' . base64_encode($subject) . '?=';

  $body  = "New lead just came in.\n\n";
  $body .= "Name:    $name\n";
  $body .= "Phone:   $phone\n";
  $body .= "Email:   " . ($email !== '' ? $email : '(none)') . "\n";
  $body .= "Source:  $source\n";
  $body .= "Time:    $when\n";
  if ($want !== '') $body .= "\nWhat they need:\n\"$want\"\n";
  $body .= "\nReply to this email to message the customer directly.\n";
  $body .= "Open the CRM: https://northstarautodetailing.ca/crm.php\n";

  // Reply-To = the customer (header-injection-sanitized + validated).
  $replyTo = '';
  $clean   = preg_replace('/[\r\n]+/', ' ', $email);
  if (filter_var($clean, FILTER_VALIDATE_EMAIL)) $replyTo = $clean;

  @crm_smtp_send($subjOut, $body, $replyTo);

  // Also fire a short text to the owner's phone via their carrier's
  // email-to-SMS gateway, if configured. Kept terse to fit one SMS; no subject
  // so the gateway delivers just this line as the text body.
  if (defined('LEAD_ALERT_SMS') && LEAD_ALERT_SMS !== '') {
    $sms = 'New lead: ' . $name . ', ' . $phone;
    if ($source !== '') $sms .= ' (' . $source . ')';
    if ($want   !== '') $sms .= ' - ' . $want;
    if (strlen($sms) > 155) $sms = substr($sms, 0, 152) . '...';
    @crm_smtp_send('', $sms, '', [LEAD_ALERT_SMS]);
  }
}

/* crm_smtp_send — minimal, dependency-free authenticated SMTP over implicit
   SSL (port 465). Sends the alert as the real configured mailbox so SPF
   passes and aligns (kills Outlook/Gmail "unverified" → junk). Returns true
   on success; all failures are soft (caller prefixes @) so a mail problem
   can never break lead capture. No-ops if mail-config.php isn't set up. */
function crm_smtp_send($subjectEncoded, $body, $replyTo = '', $toOverride = null) {
  if (!defined('SMTP_PASS') || !defined('SMTP_HOST') || SMTP_HOST === '') return false;   // no creds → skip
  if (is_array($toOverride)) {                          // explicit recipient(s), e.g. SMS gateway
    $to = array_filter(array_map('trim', $toOverride));
    $cc = [];
  } else {
    $to  = array_filter(array_map('trim', explode(',', LEAD_ALERT_TO)));
    $cc  = defined('LEAD_ALERT_CC') ? array_filter(array_map('trim', explode(',', LEAD_ALERT_CC))) : [];
  }
  $rcpts = array_merge($to, $cc);
  if (!$rcpts) return false;

  $fp = @stream_socket_client(
    'ssl://' . SMTP_HOST . ':' . SMTP_PORT, $errno, $errstr, 15,
    STREAM_CLIENT_CONNECT
  );
  if (!$fp) return false;
  stream_set_timeout($fp, 15);

  $read = function () use ($fp) {
    $out = '';
    while (($line = fgets($fp, 600)) !== false) {
      $out .= $line;
      if (strlen($line) < 4 || $line[3] !== '-') break;   // last line of reply
    }
    return $out;
  };
  $expect = function ($code) use ($read) {
    $r = $read();
    return strncmp($r, (string) $code, strlen((string) $code)) === 0;
  };
  $say = function ($cmd) use ($fp) { fwrite($fp, $cmd . "\r\n"); };
  $fail = function () use ($fp) { @fwrite($fp, "QUIT\r\n"); @fclose($fp); return false; };

  if (!$expect(220)) return $fail();
  $say('EHLO northstarautodetailing.ca'); if (!$expect(250)) return $fail();
  $say('AUTH LOGIN');              if (!$expect(334)) return $fail();
  $say(base64_encode(SMTP_USER));  if (!$expect(334)) return $fail();
  $say(base64_encode(SMTP_PASS));  if (!$expect(235)) return $fail();   // 235 = auth OK

  $say('MAIL FROM:<' . LEAD_ALERT_FROM_EMAIL . '>'); if (!$expect(250)) return $fail();
  foreach ($rcpts as $r) { $say('RCPT TO:<' . $r . '>'); if (!$expect(250)) return $fail(); }
  $say('DATA');                    if (!$expect(354)) return $fail();

  $headers  = 'Date: ' . date('r') . "\r\n";
  $headers .= 'From: ' . LEAD_ALERT_FROM_NAME . ' <' . LEAD_ALERT_FROM_EMAIL . ">\r\n";
  $headers .= 'To: ' . implode(', ', $to) . "\r\n";
  if ($cc) $headers .= 'Cc: ' . implode(', ', $cc) . "\r\n";
  if ($replyTo !== '') $headers .= 'Reply-To: ' . $replyTo . "\r\n";
  if ($subjectEncoded !== '') $headers .= 'Subject: ' . $subjectEncoded . "\r\n";
  $headers .= 'Message-ID: <' . bin2hex(random_bytes(8)) . '@northstarautodetailing.ca>' . "\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $headers .= "Content-Transfer-Encoding: 8bit\r\n";
  $headers .= "X-Mailer: NorthStar CRM\r\n";

  // Normalize newlines + dot-stuff (a line of just "." would end DATA early).
  $msg = $headers . "\r\n" . $body;
  $msg = str_replace(["\r\n", "\r", "\n"], "\n", $msg);
  $msg = str_replace("\n", "\r\n", $msg);
  $msg = preg_replace('/^\./m', '..', $msg);

  fwrite($fp, $msg . "\r\n.\r\n");
  $ok = $expect(250);
  $say('QUIT');
  @fclose($fp);
  return $ok;
}

function crm_rel_time($ts) {
  $d = time() - (int) $ts;
  if ($d < 60)     return 'Just now';
  if ($d < 3600)   return floor($d / 60) . 'm ago';
  if ($d < 86400)  return floor($d / 3600) . 'h ago';
  if ($d < 604800) return floor($d / 86400) . 'd ago';
  return date('M j', (int) $ts);
}

/* Map a stored lead into the shape the CRM front-end expects.
   Stored notes/thread entries carry a unix `ts`; we render display
   times from it here so "2h ago" etc. stay correct over time.
   Facts we don't collect from the website (package, preferred date,
   service address) default to neutral for the operator to fill in. */
function crm_present($l) {
  $ts   = $l['ts'] ?? time();
  $want = trim($l['want'] ?? '');

  $thread = [];
  foreach (($l['thread'] ?? []) as $m) {
    $mts = $m['ts'] ?? $ts;
    $thread[] = [
      'dir'  => $m['dir'] ?? 'in',
      'ch'   => $m['ch'] ?? 'sms',
      'text' => $m['text'] ?? '',
      'time' => date('g:i A', $mts),
    ];
  }

  $notes = [];
  foreach (($l['notes'] ?? []) as $n) {
    $nts = $n['ts'] ?? $ts;
    $notes[] = [
      'by'   => $n['by'] ?? 'owner',
      'text' => $n['text'] ?? '',
      'time' => crm_rel_time($nts),
    ];
  }

  $vehicle = $l['vehicle'] ?? null;
  if (!$vehicle) $vehicle = $want !== '' ? mb_strimwidth($want, 0, 42, '…') : '—';

  return [
    'id'            => $l['id'],
    'name'          => $l['name'],
    'phone'         => $l['phone'],
    'email'         => $l['email'],
    'vehicle'       => $vehicle,
    'package'       => $l['package'] ?? '—',
    'preferredDate' => $l['preferredDate'] ?? '—',
    'address'       => $l['address'] ?? '—',
    'source'        => $l['source'] ?? 'Website form',
    'stage'         => $l['stage'] ?? 'new',
    'ts'            => (int) $ts,
    'lastAttempt'   => isset($l['lastAttemptTs']) ? crm_rel_time($l['lastAttemptTs']) : '—',
    'lastResponse'  => '—',
    'createdAt'     => crm_rel_time($ts),
    'followUp'      => (isset($l['followUp']) && is_array($l['followUp']) && !empty($l['followUp']['date']))
                        ? ['date' => $l['followUp']['date'], 'note' => $l['followUp']['note'] ?? '']
                        : null,
    'notes'         => $notes,
    'thread'        => $thread,
  ];
}
