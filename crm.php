<?php
/* crm.php — NorthStar CRM. Server-enforced guard: no valid session,
   no page. Direct-URL visitors are bounced to login.php. */
session_start();
if (empty($_SESSION['crm_auth'])) {
  header('Location: login.php');
  exit;
}
header('Cache-Control: no-store, no-cache, must-revalidate');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>NorthStar CRM</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%232F6FED'/%3E%3Cpath d='M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8' stroke='%23fff' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #0B0D11;
    --panel: #15181E;
    --panel-2: #1A1E25;
    --elev: #20242C;
    --line: rgba(255,255,255,0.08);
    --line-2: rgba(255,255,255,0.14);
    --fg: #F2F4F7;
    --fg-2: rgba(242,244,247,0.60);
    --fg-3: rgba(242,244,247,0.38);
    --accent: #2F6FED;
    --accent-dim: rgba(47,111,237,0.15);
    --accent-dark: #1E54C7;
    --blue: #5B8DEF;
    --amber: #F2B33D;
    --violet: #9B7BF0;
    --teal: #2FC1C9;
    --red: #E0533D;
    --radius: 16px;
    --radius-sm: 10px;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-body: 'Hanken Grotesk', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: var(--font-body); font-size: 14px; line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--accent); color: #fff; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 8px; border: 2px solid var(--bg); }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
  button { font-family: inherit; }

  /* ---------- App shell ---------- */
  .app { display: grid; grid-template-columns: 232px 1fr; height: 100vh; overflow: hidden; }

  .sidebar { background: #0E1015; border-right: 1px solid var(--line); display: flex; flex-direction: column; padding: 18px 14px; }
  .sb-brand { display: flex; align-items: center; gap: 9px; font-family: var(--font-display); font-weight: 800; font-size: 18px; letter-spacing: -0.02em; padding: 6px 8px 22px; }
  .sb-brand .mk { width: 30px; height: 30px; border-radius: 9px; background: var(--accent); color: #fff; display: grid; place-items: center; }
  .sb-brand .mk svg { width: 16px; height: 16px; }
  .sb-brand .pill { margin-left: 2px; font-family: var(--font-mono); font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); background: var(--accent-dim); padding: 3px 7px; border-radius: 999px; }
  .sb-nav { display: flex; flex-direction: column; gap: 3px; }
  .sb-link { display: flex; align-items: center; gap: 11px; padding: 10px 11px; border-radius: 10px; color: var(--fg-2); font-weight: 600; font-size: 14px; cursor: pointer; border: none; background: transparent; text-align: left; width: 100%; transition: background .14s ease, color .14s ease; }
  .sb-link svg { width: 18px; height: 18px; }
  .sb-link:hover { background: rgba(255,255,255,0.04); color: var(--fg); }
  .sb-link.active { background: var(--accent-dim); color: var(--accent); }
  .sb-sec { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-3); padding: 18px 11px 8px; }
  .sb-foot { margin-top: auto; }
  .sb-team { display: flex; flex-direction: column; gap: 2px; }
  .sb-teammate { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 9px; font-size: 13px; color: var(--fg-2); }
  .sb-teammate .on { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); margin-left: auto; }

  /* avatar */
  .av { border-radius: 50%; display: grid; place-items: center; font-family: var(--font-display); font-weight: 800; color: #fff; flex-shrink: 0; }

  /* ---------- Main ---------- */
  .main { display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 62px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 16px; padding: 0 24px; flex-shrink: 0; }
  .search { flex: 1; max-width: 420px; display: flex; align-items: center; gap: 9px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 9px 13px; color: var(--fg-3); }
  .search svg { width: 16px; height: 16px; flex-shrink: 0; }
  .search input { flex: 1; background: none; border: none; outline: none; color: var(--fg); font-family: inherit; font-size: 14px; }
  .search input::placeholder { color: var(--fg-3); }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
  .viewas { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--fg-2); }
  .usermenu { position: relative; }
  .userbtn { display: flex; align-items: center; gap: 9px; background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 5px 9px 5px 6px; cursor: pointer; color: var(--fg); transition: border-color .15s ease; }
  .userbtn:hover { border-color: var(--line-2); }
  .userbtn .nm { font-weight: 600; font-size: 13px; }
  .userbtn .rl { font-size: 11px; color: var(--fg-3); }
  .userbtn svg { width: 15px; height: 15px; color: var(--fg-3); }
  .dropdown { position: absolute; right: 0; top: calc(100% + 8px); background: var(--elev); border: 1px solid var(--line-2); border-radius: 12px; padding: 6px; min-width: 220px; box-shadow: 0 24px 60px -20px rgba(0,0,0,0.7); z-index: 30; animation: pop .14s ease; }
  @keyframes pop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  .dd-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-3); padding: 8px 10px 5px; }
  .dd-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; color: var(--fg); font-size: 13.5px; border: none; background: none; width: 100%; text-align: left; }
  .dd-item:hover { background: rgba(255,255,255,0.05); }
  .dd-item .meta { margin-left: auto; font-size: 11px; color: var(--fg-3); }
  .dd-item.active { color: var(--accent); }
  .dd-sep { height: 1px; background: var(--line); margin: 6px 4px; }

  /* ---------- Content scroll ---------- */
  .content { flex: 1; overflow-y: auto; padding: 26px 24px 60px; }
  .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; gap: 16px; flex-wrap: wrap; }
  .page-head h1 { font-family: var(--font-display); font-weight: 800; font-size: 26px; letter-spacing: -0.02em; margin: 0; }
  .page-head .sub { color: var(--fg-2); font-size: 13.5px; margin-top: 3px; }
  .btn { font-family: var(--font-body); font-weight: 600; font-size: 13.5px; border: none; cursor: pointer; border-radius: 9px; padding: 9px 14px; display: inline-flex; align-items: center; gap: 7px; transition: transform .14s ease, background .15s ease, border-color .15s ease; }
  .btn svg { width: 16px; height: 16px; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #3f7ef5; transform: translateY(-1px); }
  .btn-ghost { background: var(--panel); color: var(--fg); border: 1px solid var(--line); }
  .btn-ghost:hover { border-color: var(--line-2); }
  .btn-sm { padding: 7px 11px; font-size: 12.5px; }

  /* ---------- KPI cards ---------- */
  .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 18px; }
  .kpi { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 17px; position: relative; overflow: hidden; }
  .kpi .k-ico { position: absolute; top: 14px; right: 14px; width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; }
  .kpi .k-ico svg { width: 16px; height: 16px; }
  .kpi .k-val { font-family: var(--font-display); font-weight: 800; font-size: 30px; letter-spacing: -0.02em; line-height: 1; margin: 6px 0 4px; }
  .kpi .k-label { font-size: 12.5px; color: var(--fg-2); font-weight: 500; }
  .kpi .k-delta { font-size: 11.5px; font-weight: 600; margin-top: 7px; display: inline-flex; align-items: center; gap: 4px; }
  .k-delta.up { color: var(--accent); } .k-delta.flat { color: var(--fg-3); }

  /* ---------- Two-col dash row ---------- */
  .dash-row { display: grid; grid-template-columns: 1.55fr 1fr; gap: 14px; margin-bottom: 22px; }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 18px 20px; }
  .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-head h3 { font-family: var(--font-display); font-weight: 700; font-size: 16px; margin: 0; letter-spacing: -0.01em; }
  .card-head .hint { font-size: 12px; color: var(--fg-3); }

  /* stage funnel */
  .funnel { display: flex; flex-direction: column; gap: 11px; }
  .fn-row { display: grid; grid-template-columns: 96px 1fr 34px; align-items: center; gap: 12px; cursor: pointer; }
  .fn-row .fn-name { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .fn-row .fn-dot { width: 9px; height: 9px; border-radius: 3px; }
  .fn-bar { height: 9px; background: rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; }
  .fn-bar span { display: block; height: 100%; border-radius: 6px; transition: width .6s cubic-bezier(.2,.8,.2,1); }
  .fn-row .fn-num { font-family: var(--font-mono); font-size: 13px; font-weight: 700; text-align: right; }
  .fn-row:hover .fn-name { color: #fff; }

  /* activity feed */
  .feed { display: flex; flex-direction: column; gap: 2px; max-height: 246px; overflow-y: auto; margin: -4px -6px; padding: 4px 6px; }
  .feed-item { display: flex; gap: 11px; padding: 9px 6px; border-radius: 9px; }
  .feed-item:hover { background: rgba(255,255,255,0.03); }
  .feed-ico { width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0; display: grid; place-items: center; background: var(--panel-2); color: var(--fg-2); }
  .feed-ico svg { width: 15px; height: 15px; }
  .feed-txt { font-size: 13px; line-height: 1.4; }
  .feed-txt b { font-weight: 700; }
  .feed-txt .who { color: var(--accent); font-weight: 700; }
  .feed-txt .det { color: var(--fg-2); }
  .feed-time { margin-left: auto; font-size: 11px; color: var(--fg-3); white-space: nowrap; font-family: var(--font-mono); }

  /* ---------- Rep tabs ---------- */
  .tabs { display: flex; gap: 6px; margin-bottom: 14px; align-items: center; flex-wrap: wrap; }
  .tab { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: var(--panel); border: 1px solid var(--line); color: var(--fg-2); font-weight: 600; font-size: 13px; cursor: pointer; transition: all .14s ease; }
  .tab:hover { border-color: var(--line-2); color: var(--fg); }
  .tab.active { background: var(--fg); color: #0B0D11; border-color: var(--fg); }
  .tab .cnt { font-family: var(--font-mono); font-size: 11.5px; opacity: .7; }
  .tab.active .cnt { opacity: .85; }
  .tabs .spacer { flex: 1; }

  /* ---------- Table ---------- */
  .table-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
  table.leads { width: 100%; border-collapse: collapse; }
  table.leads th { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--fg-3); padding: 13px 14px; border-bottom: 1px solid var(--line); white-space: nowrap; cursor: pointer; user-select: none; position: sticky; top: 0; background: var(--panel); }
  table.leads th .th-in { display: inline-flex; align-items: center; gap: 5px; }
  table.leads th svg { width: 12px; height: 12px; opacity: 0; }
  table.leads th.sorted svg { opacity: 1; color: var(--accent); }
  table.leads th:hover { color: var(--fg-2); }
  table.leads td { padding: 13px 14px; border-bottom: 1px solid var(--line); font-size: 13px; vertical-align: middle; }
  table.leads tbody tr { cursor: pointer; transition: background .12s ease; }
  table.leads tbody tr:hover { background: rgba(255,255,255,0.025); }
  table.leads tbody tr:last-child td { border-bottom: none; }
  .lead-name { font-weight: 700; font-size: 13.5px; }
  .lead-id { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); }
  .cell-contact { display: flex; flex-direction: column; gap: 1px; }
  .cell-contact .ph { font-family: var(--font-mono); font-size: 12px; color: var(--fg-2); }
  .cell-contact .em { font-size: 11.5px; color: var(--fg-3); }
  .muted { color: var(--fg-3); }
  .mono { font-family: var(--font-mono); }

  /* badges */
  .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
  .badge .bd { width: 6px; height: 6px; border-radius: 50%; }
  .stage-pill { border: 1px solid transparent; cursor: pointer; }
  .pkg-chip { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .assign-cell { display: inline-flex; align-items: center; gap: 7px; }
  .assign-cell .nm { font-size: 12.5px; font-weight: 600; }
  .assign-cell.unassigned { color: var(--fg-3); font-style: italic; font-size: 12.5px; }

  /* empty state */
  .empty { text-align: center; padding: 60px 20px; color: var(--fg-3); }
  .empty svg { width: 34px; height: 34px; margin-bottom: 12px; opacity: .5; }

  /* ---------- Lead drawer ---------- */
  .drawer-scrim { position: fixed; inset: 0; background: rgba(5,6,9,0.55); backdrop-filter: blur(3px); z-index: 60; animation: fade .2s ease; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  .drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 480px; max-width: 94vw; background: var(--bg); border-left: 1px solid var(--line-2); z-index: 61; display: flex; flex-direction: column; box-shadow: -30px 0 80px -30px rgba(0,0,0,0.7); animation: slidein .3s cubic-bezier(.2,.8,.2,1); }
  @keyframes slidein { from { transform: translateX(100%); } to { transform: none; } }

  /* New-lead modal (manual entry) */
  .nl-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 560px; max-width: 94vw; max-height: 92vh; overflow-y: auto; background: var(--bg); border: 1px solid var(--line-2); border-radius: 16px; z-index: 61; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.75); animation: pop .22s cubic-bezier(.2,.8,.2,1); }
  @keyframes pop { from { opacity: 0; transform: translate(-50%, -47%) scale(.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  .nl-head { display: flex; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--line); }
  .nl-head h2 { font-family: var(--font-display); font-weight: 800; font-size: 19px; letter-spacing: -0.02em; margin: 0; display: flex; align-items: center; gap: 9px; }
  .nl-head h2 svg { width: 18px; height: 18px; color: var(--accent); }
  .nl-body { padding: 18px 22px 20px; }
  .nl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .nl-field { display: flex; flex-direction: column; }
  .nl-field.nl-span { grid-column: 1 / -1; }
  .nl-field label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 6px; }
  .nl-input { width: 100%; background: var(--panel); border: 1px solid var(--line); border-radius: 9px; color: var(--fg); font-family: inherit; font-size: 13px; font-weight: 600; padding: 9px 11px; outline: none; transition: border-color .12s; }
  .nl-input::placeholder { color: var(--fg-3); font-weight: 500; }
  .nl-input:focus { border-color: var(--accent); }
  .nl-sel { position: relative; }
  .nl-sel select { width: 100%; appearance: none; background: var(--panel); border: 1px solid var(--line); border-radius: 9px; color: var(--fg); font-family: inherit; font-size: 13px; font-weight: 600; padding: 9px 30px 9px 11px; cursor: pointer; outline: none; }
  .nl-sel select:focus { border-color: var(--accent); }
  .nl-sel svg { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--fg-3); pointer-events: none; }
  .nl-err { margin-top: 14px; font-size: 12.5px; font-weight: 600; color: var(--rose, #f43f5e); }
  .nl-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .nl-foot .btn[disabled] { opacity: .6; cursor: default; }
  .dr-head { padding: 20px 22px 18px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
  .dr-top { display: flex; align-items: flex-start; gap: 13px; }
  .dr-top .dr-id { font-family: var(--font-mono); font-size: 11px; color: var(--fg-3); }
  .dr-top h2 { font-family: var(--font-display); font-weight: 800; font-size: 22px; letter-spacing: -0.02em; margin: 2px 0 0; }
  .dr-close { margin-left: auto; width: 32px; height: 32px; border-radius: 9px; background: var(--panel); border: 1px solid var(--line); color: var(--fg-2); cursor: pointer; display: grid; place-items: center; }
  .dr-close:hover { color: #fff; border-color: var(--line-2); }
  .dr-close svg { width: 16px; height: 16px; }
  .dr-del { width: 32px; height: 32px; border-radius: 9px; background: var(--panel); border: 1px solid var(--line); color: var(--fg-3); cursor: pointer; display: grid; place-items: center; margin-left: auto; }
  .dr-del:hover { color: var(--red); border-color: rgba(224,83,61,0.4); }
  .dr-del svg { width: 15px; height: 15px; }
  .dr-del-row { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .dr-del-row span { font-size: 12.5px; color: var(--fg-2); white-space: nowrap; }
  .btn-danger { background: rgba(224,83,61,0.14); color: var(--red); border: 1px solid rgba(224,83,61,0.3); }
  .btn-danger:hover { background: rgba(224,83,61,0.24); }
  .dr-contacts { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .dr-contacts a { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--fg); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 7px 11px; font-family: var(--font-mono); }
  .dr-contacts a:hover { border-color: var(--line-2); }
  .dr-contacts a svg { width: 14px; height: 14px; color: var(--fg-2); }

  .dr-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 22px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
  .ctrl { }
  .ctrl label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 6px; }
  .sel { position: relative; }
  .sel select { width: 100%; appearance: none; background: var(--panel); border: 1px solid var(--line); border-radius: 9px; color: var(--fg); font-family: inherit; font-size: 13px; font-weight: 600; padding: 9px 30px 9px 11px; cursor: pointer; }
  .sel select:focus { outline: none; border-color: var(--accent); }
  .sel svg { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--fg-3); pointer-events: none; }

  .dr-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--line); border-bottom: 1px solid var(--line); flex-shrink: 0; }
  .fact { background: var(--bg); padding: 13px 22px; }
  .fact.fact-span { grid-column: 1 / -1; }
  .fact .fl { font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 4px; }
  .fact .fv { font-size: 14px; font-weight: 600; }
  input.fv-edit { background: none; border: 1px solid transparent; border-radius: 7px; color: var(--fg); font-family: inherit; font-size: 14px; font-weight: 600; padding: 2px 5px; margin: -2px -5px; width: calc(100% + 10px); outline: none; transition: background .12s, border-color .12s; }
  input.fv-edit:hover { background: var(--panel); border-color: var(--line); }
  input.fv-edit:focus { background: var(--panel); border-color: var(--accent); }

  .dr-tabs { display: flex; gap: 4px; padding: 12px 22px 0; flex-shrink: 0; }
  .dr-tab { padding: 8px 13px; border-radius: 8px 8px 0 0; font-size: 13px; font-weight: 600; color: var(--fg-3); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; }
  .dr-tab.active { color: var(--fg); border-bottom-color: var(--accent); }
  .dr-tab:hover { color: var(--fg-2); }

  .dr-body { flex: 1; overflow-y: auto; padding: 18px 22px; }

  /* thread */
  .thread { display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 82%; }
  .msg.in { align-self: flex-start; }
  .msg.out { align-self: flex-end; }
  .msg .bub { padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.45; }
  .msg.in .bub { background: var(--panel-2); border-bottom-left-radius: 4px; }
  .msg.out .bub { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
  .msg .mt { font-size: 10.5px; color: var(--fg-3); margin: 4px 4px 0; display: flex; gap: 7px; align-items: center; font-family: var(--font-mono); }
  .msg.out .mt { justify-content: flex-end; }
  .ch-tag { display: inline-flex; align-items: center; gap: 4px; }
  .ch-tag svg { width: 11px; height: 11px; }

  /* composer */
  .composer2 { border-top: 1px solid var(--line); padding: 13px 22px 18px; flex-shrink: 0; background: var(--bg); }
  .ch-toggle { display: inline-flex; gap: 3px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 3px; margin-bottom: 9px; }
  .ch-toggle button { border: none; background: none; color: var(--fg-3); font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .ch-toggle button svg { width: 13px; height: 13px; }
  .ch-toggle button.on { background: var(--accent-dim); color: var(--accent); }
  .comp-input { display: flex; gap: 9px; align-items: flex-end; }
  .comp-input textarea { flex: 1; background: var(--panel); border: 1px solid var(--line); border-radius: 11px; color: var(--fg); font-family: inherit; font-size: 13.5px; padding: 11px 13px; resize: none; min-height: 44px; max-height: 120px; }
  .comp-input textarea:focus { outline: none; border-color: var(--accent); }
  .comp-send { width: 44px; height: 44px; border-radius: 11px; background: var(--accent); border: none; color: #fff; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; transition: background .15s ease; }
  .comp-send:hover { background: #3f7ef5; }
  .comp-send:disabled { background: var(--panel-2); color: var(--fg-3); cursor: not-allowed; }
  .comp-send svg { width: 18px; height: 18px; }

  /* notes */
  .note { background: var(--panel); border: 1px solid var(--line); border-radius: 11px; padding: 12px 13px; margin-bottom: 10px; }
  .note .nh { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .note .nh .nm { font-size: 12.5px; font-weight: 700; }
  .note .nh .nt { font-size: 10.5px; color: var(--fg-3); margin-left: auto; font-family: var(--font-mono); }
  .note p { margin: 0; font-size: 13px; color: var(--fg); line-height: 1.45; }
  .note-add { display: flex; gap: 9px; margin-top: 4px; }
  .note-add input { flex: 1; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; color: var(--fg); font-family: inherit; font-size: 13px; padding: 10px 12px; }
  .note-add input:focus { outline: none; border-color: var(--accent); }

  /* log call */
  .logrow { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); background: var(--elev); border: 1px solid var(--line-2); color: var(--fg); padding: 11px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; z-index: 90; box-shadow: 0 20px 50px -16px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 9px; animation: toastin .3s cubic-bezier(.2,.8,.2,1); }
  .toast svg { width: 16px; height: 16px; color: var(--accent); }
  @keyframes toastin { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }

  /* ---------- Pipeline board ---------- */
  .pipeline { display: flex; gap: 14px; overflow-x: auto; overflow-y: hidden; height: calc(100vh - 226px); min-height: 400px; padding-bottom: 8px; }
  .pl-col { width: 268px; min-width: 268px; display: flex; flex-direction: column; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; transition: border-color .15s ease, box-shadow .15s ease; }
  .pl-col.over { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .pl-col-head { padding: 13px 14px 11px; flex-shrink: 0; border-bottom: 1px solid var(--line); }
  .pl-col-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13.5px; }
  .pl-cnt { font-family: var(--font-mono); font-size: 11px; background: rgba(255,255,255,0.07); color: var(--fg-2); padding: 2px 7px; border-radius: 999px; margin-left: 2px; }
  .pl-col-body { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .pl-card { background: var(--panel-2); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 13px; cursor: grab; transition: border-color .14s ease, transform .14s ease, opacity .14s ease; user-select: none; }
  .pl-card:hover { border-color: var(--line-2); transform: translateY(-1px); }
  .pl-card:active { cursor: grabbing; }
  .pl-card.dragging { opacity: 0.35; transform: scale(0.97); }
  .pl-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 2px; }
  .pl-name { font-weight: 700; font-size: 13.5px; }
  .pl-id { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); white-space: nowrap; padding-top: 2px; }
  .pl-vehicle { font-size: 12.5px; color: var(--fg-2); margin-bottom: 8px; }
  .pl-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
  .pl-card-foot { display: flex; align-items: center; justify-content: flex-end; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--line); }
  .pl-time { font-size: 11px; color: var(--fg-3); font-family: var(--font-mono); }
  .pl-empty { text-align: center; padding: 28px 12px; color: var(--fg-3); font-size: 12px; border: 1.5px dashed rgba(255,255,255,0.10); border-radius: 9px; margin-top: 2px; }

  /* ---------- Follow-up reminders ---------- */
  .dr-bell { width: 32px; height: 32px; border-radius: 9px; background: var(--panel); border: 1px solid var(--line); color: var(--fg-3); cursor: pointer; display: grid; place-items: center; margin-left: auto; }
  .dr-bell:hover { color: var(--amber); border-color: rgba(242,179,61,0.4); }
  .dr-bell svg { width: 16px; height: 16px; }
  .dr-bell.on { color: var(--amber); border-color: rgba(242,179,61,0.45); background: rgba(242,179,61,0.10); }
  .dr-bell.on.fu-overdue { color: var(--red); border-color: rgba(224,83,61,0.5); background: rgba(224,83,61,0.12); }
  .dr-bell.on.fu-upcoming { color: var(--blue); border-color: rgba(91,141,239,0.45); background: rgba(91,141,239,0.10); }
  .dr-bell + .dr-del { margin-left: 0; }

  .fu-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 999px; border: 1px solid transparent; white-space: nowrap; margin-top: 5px; }
  .fu-badge svg { width: 12px; height: 12px; }
  .fu-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 2px; vertical-align: middle; }

  table.leads tbody tr.fu-row-due { background: rgba(242,179,61,0.05); box-shadow: inset 3px 0 0 var(--amber); }
  table.leads tbody tr.fu-row-due:hover { background: rgba(242,179,61,0.09); }

  .pl-fu { margin: 2px 0 7px; }
  .pl-card.fu-card-due { border-color: rgba(242,179,61,0.55); box-shadow: 0 0 0 1px rgba(242,179,61,0.35); }

  .fu-status { display: flex; align-items: flex-start; gap: 11px; padding: 13px 14px; border-radius: 12px; margin-bottom: 18px; border: 1px solid transparent; }
  .fu-status svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
  .fu-status-main { font-weight: 700; font-size: 14px; }
  .fu-status-sub { font-size: 12px; color: var(--fg-3); margin-top: 2px; }
  .fu-status.fu-overdue { background: rgba(224,83,61,0.10); border-color: rgba(224,83,61,0.3); color: var(--red); }
  .fu-status.fu-today { background: rgba(242,179,61,0.10); border-color: rgba(242,179,61,0.3); color: var(--amber); }
  .fu-status.fu-upcoming { background: rgba(91,141,239,0.10); border-color: rgba(91,141,239,0.3); color: var(--blue); }

  .fu-field-lbl { display: block; font-size: 12px; font-weight: 700; color: var(--fg-2); margin-bottom: 7px; }
  .fu-date { width: 100%; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; color: var(--fg); font-family: inherit; font-size: 13px; padding: 10px 12px; color-scheme: dark; }
  .fu-date:focus { outline: none; border-color: var(--accent); }
  .fu-note { width: 100%; min-height: 84px; resize: vertical; box-sizing: border-box; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; color: var(--fg); font-family: inherit; font-size: 13px; padding: 10px 12px; line-height: 1.5; }
  .fu-note:focus { outline: none; border-color: var(--accent); }
  .fu-actions { display: flex; gap: 9px; margin-top: 16px; }

  /* ---------- Reports ---------- */
  .rpt-chart { display: flex; gap: 5px; align-items: flex-end; height: 160px; padding: 20px 0 0; }
  .rpt-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
  .rpt-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; padding-bottom: 6px; }
  .rpt-bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; min-height: 3px; position: relative; transition: height .5s cubic-bezier(.2,.8,.2,1); }
  .rpt-bar-num { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--fg-2); white-space: nowrap; }
  .rpt-bar-lbl { font-size: 9.5px; color: var(--fg-3); white-space: nowrap; text-align: center; margin-top: 4px; }
  .rpt-fn { grid-template-columns: 96px 1fr 34px 38px !important; cursor: default !important; }
  .rpt-pct { font-family: var(--font-mono); font-size: 11px; color: var(--fg-3); text-align: right; }

  /* new-lead badge */
  .sb-badge { margin-left: auto; background: var(--accent); color: #fff; font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px; animation: badge-pulse 2.2s ease-in-out infinite; }
  @keyframes badge-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(47,111,237,0.55); } 55% { box-shadow: 0 0 0 6px rgba(47,111,237,0); } }

  /* responsive */
  @media (max-width: 1100px) {
    .kpis { grid-template-columns: repeat(3, 1fr); }
    .dash-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 860px) {
    .app { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .kpis { grid-template-columns: repeat(2, 1fr); }
    .content { padding: 18px 14px 50px; }
  }
</style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <script type="text/babel" src="icons.jsx?v=1"></script>
  <script type="text/babel" src="crm-data.jsx?v=1"></script>
  <script type="text/babel" src="crm-leaddetail.jsx?v=1"></script>
  <script type="text/babel" src="crm-app.jsx?v=1"></script>
</body>
</html>
