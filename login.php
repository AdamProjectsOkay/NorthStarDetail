<?php
/* login.php — NorthStar CRM staff sign-in (server-enforced).
   Validates against crm-auth.php, then starts a PHP session and
   forwards to crm.php. The CRM page itself refuses to load without
   a valid session, so this is the only way in. */
session_start();
require __DIR__ . '/crm-auth.php';

// Already signed in? Go straight to the CRM.
if (!empty($_SESSION['crm_auth'])) {
  header('Location: crm.php');
  exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = strtolower(trim($_POST['user'] ?? ''));
  $pass = (string) ($_POST['pass'] ?? '');
  usleep(350000); // small, constant delay to blunt brute-forcing
  if (isset($CRM_USERS[$user]) && password_verify($pass, $CRM_USERS[$user])) {
    session_regenerate_id(true);
    $_SESSION['crm_auth'] = true;
    $_SESSION['crm_user'] = $user;
    header('Location: crm.php');
    exit;
  }
  $error = 'Incorrect username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>NorthStar CRM · Staff sign in</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%232F6FED'/%3E%3Cpath d='M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8' stroke='%23fff' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />
<style>
  :root {
    --accent: #2F6FED;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-body: 'Hanken Grotesk', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    font-family: var(--font-body); background: #0B0D11; color: #fff;
    display: grid; place-items: center; padding: 20px; -webkit-font-smoothing: antialiased;
  }
  .bg { position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(900px 500px at 50% -10%, rgba(47,111,237,0.18), transparent 70%),
      radial-gradient(700px 500px at 90% 110%, rgba(47,111,237,0.10), transparent 70%); }
  .card {
    position: relative; z-index: 1; width: 100%; max-width: 400px; background: #15171C;
    border-radius: 22px; padding: 32px 30px 26px; border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 50px 110px -30px rgba(0,0,0,0.7); animation: rise .34s cubic-bezier(.2,.8,.2,1);
  }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .brand { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-display);
    font-weight: 800; font-size: 18px; letter-spacing: -0.02em; margin-bottom: 22px; }
  .brand .mk { width: 30px; height: 30px; border-radius: 9px; background: var(--accent); display: grid; place-items: center; }
  .brand .mk svg { width: 16px; height: 16px; }
  .brand .pill { margin-left: 4px; font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent);
    background: rgba(47,111,237,0.16); padding: 4px 8px; border-radius: 999px; }
  h2 { font-family: var(--font-display); font-weight: 700; font-size: 24px; letter-spacing: -0.02em; margin: 0 0 4px; }
  .sub { color: rgba(255,255,255,0.5); font-size: 13.5px; margin: 0 0 22px; }
  .field { margin-bottom: 13px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.62); margin-bottom: 6px; }
  .field input { width: 100%; font-family: var(--font-body); font-size: 15px; color: #fff;
    background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 11px; padding: 12px 13px;
    transition: border-color .16s ease, box-shadow .16s ease, background .16s ease; }
  .field input::placeholder { color: rgba(255,255,255,0.32); }
  .field input:focus { outline: none; border-color: var(--accent); background: rgba(255,255,255,0.08);
    box-shadow: 0 0 0 4px rgba(47,111,237,0.18); }
  .err { background: rgba(224,83,61,0.12); border: 1px solid rgba(224,83,61,0.4); color: #ffb4a6;
    font-size: 13px; border-radius: 11px; padding: 11px 13px; margin: 0 0 16px; }
  .btn { width: 100%; justify-content: center; display: inline-flex; align-items: center; gap: 8px;
    margin-top: 6px; padding: 14px; font-size: 16px; font-weight: 700; font-family: var(--font-body);
    color: #fff; background: var(--accent); border: none; border-radius: 12px; cursor: pointer;
    transition: filter .15s ease, transform .04s ease; }
  .btn:hover { filter: brightness(1.06); }
  .btn:active { transform: translateY(1px); }
  .btn svg { width: 17px; height: 17px; }
  .foot { margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; }
  .foot small { color: rgba(255,255,255,0.4); font-size: 11.5px; font-family: var(--font-mono); letter-spacing: 0.03em; }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="card" role="dialog" aria-modal="true" aria-label="NorthStar staff login">
    <div class="brand">
      <span class="mk">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      NorthStar <span class="pill">CRM</span>
    </div>
    <h2>Staff sign in</h2>
    <p class="sub">Authorized NorthStar staff only.</p>
    <?php if ($error): ?><div class="err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <form method="post" action="login.php" autocomplete="on">
      <div class="field">
        <label for="user">Username</label>
        <input id="user" name="user" type="text" autocapitalize="none" autocomplete="username"
               placeholder="username" autofocus value="<?= htmlspecialchars($_POST['user'] ?? '') ?>" />
      </div>
      <div class="field">
        <label for="pass">Password</label>
        <input id="pass" name="pass" type="password" autocomplete="current-password" placeholder="••••••••" />
      </div>
      <button type="submit" class="btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Sign in
      </button>
    </form>
    <div class="foot"><small>SECURE STAFF PORTAL · northstarautodetailing.ca</small></div>
  </div>
</body>
</html>
