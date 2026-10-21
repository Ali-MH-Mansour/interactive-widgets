"""Generate the standalone demo page (index.html) for every published widget from the registry.

Usage: python tools/gen-widget-pages.py [--only of-id]
A demo page shows the widget twice (default config in EN, a custom config in RU) and prints
getConfig() on every change event, exactly like the of-template demo. Pure stdlib.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = json.loads((ROOT / "widgets" / "registry.json").read_text(encoding="utf-8"))

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{id} — standalone demo</title>
  <link rel="stylesheet" href="../../styles.css">
  <style> body {{ padding: 24px; max-width: 860px; margin: auto; }} .demo {{ display: grid; gap: 16px; }} </style>
</head>
<body>
  <div class="demo">
    <p class="muted">Standalone demo — opens from <code>file://</code>, no server needed. Default config (EN), then a custom one (RU).</p>
    <{id} lang="en"></{id}>
    <{id} lang="ru" config='{custom}'></{id}>
    <p class="muted">Current config of the first widget (from <code>getConfig()</code> on every <code>change</code> event):</p>
    <pre id="out">{{}}</pre>
  </div>
  <script src="./component.js"></script>
  <script>
    const first = document.querySelector('{id}');
    first.addEventListener('change', (e) => {{ document.getElementById('out').textContent = JSON.stringify(e.detail); }});
  </script>
</body>
</html>
"""

only = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--only" else None
for w in REG["widgets"]:
    if w.get("status") != "published" or (only and w["id"] != only):
        continue
    custom = json.dumps(w.get("demo_config", {}), ensure_ascii=False)
    out = ROOT / "widgets" / w["id"] / "index.html"
    out.write_text(PAGE.format(id=w["id"], custom=custom), encoding="utf-8", newline="\n")
    print("wrote", out.relative_to(ROOT))
