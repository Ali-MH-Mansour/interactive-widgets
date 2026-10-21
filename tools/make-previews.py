"""Capture widgets/<id>/preview.png (640x400, default state) with headless Edge or Chrome.

Usage: python tools/make-previews.py [of-id ...]     (default: every published widget)
Renders tools/preview.html?w=<id> from file:// (widgets load as classic scripts) and screenshots it.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    shutil.which("msedge"), shutil.which("chrome"), shutil.which("google-chrome"), shutil.which("chromium"),
]
browser = next((b for b in BROWSERS if b and Path(b).exists()), None)
if not browser:
    sys.exit("no Edge/Chrome found")

reg = json.loads((ROOT / "widgets" / "registry.json").read_text(encoding="utf-8"))
ids = sys.argv[1:] or [w["id"] for w in reg["widgets"] if w.get("status") == "published"]
profile = Path(tempfile.gettempdir()) / "iw-preview-profile"
for wid in ids:
    out = ROOT / "widgets" / wid / "preview.png"
    url = (ROOT / "tools" / "preview.html").as_uri() + f"?w={wid}"
    cmd = [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={profile}",
           "--window-size=640,400", "--virtual-time-budget=2000", f"--screenshot={out}", url]
    subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    time.sleep(0.3)
    print(wid, "ok" if out.exists() and out.stat().st_size > 1000 else "FAILED", out.stat().st_size if out.exists() else 0)
