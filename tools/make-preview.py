"""Render a 640x400 preview.png for of-template (default state: y = 1*x + 0).

Usage: python tools/make-preview.py [out-path]
Pure Pillow; the drawing mirrors component.js's _draw() so the preview matches the live widget.
Reusable for other widgets by copying and replacing draw_widget().
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

W, H = 640, 400
BG, CARD, GRID, AXIS, LINE, TEXT = "#0f1216", "#1b2129", "#2a323d", "#9aa4b2", "#4cc9f0", "#e6e9ee"
cfg = dict(a=1.0, b=0.0, xmin=-5, xmax=5, ymin=-10, ymax=10)


def draw_widget(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=CARD)
    d.text((16, 12), "Line: y = a·x + b", fill=TEXT)
    d.text((16, 30), "Move the sliders and watch the line tilt and shift.", fill=AXIS)
    x0, y0, x1, y1 = 16, 52, W - 16, H - 70
    d.rectangle([x0, y0, x1, y1], fill=BG)
    pad = 24
    px0, py0, px1, py1 = x0 + pad, y0 + pad, x1 - pad, y1 - pad

    def sx(x):
        return px0 + (x - cfg["xmin"]) / (cfg["xmax"] - cfg["xmin"]) * (px1 - px0)

    def sy(y):
        return py1 - (y - cfg["ymin"]) / (cfg["ymax"] - cfg["ymin"]) * (py1 - py0)

    for x in range(cfg["xmin"], cfg["xmax"] + 1):
        d.line([(sx(x), py0), (sx(x), py1)], fill=GRID)
    for y in range(cfg["ymin"], cfg["ymax"] + 1, 2):
        d.line([(px0, sy(y)), (px1, sy(y))], fill=GRID)
    d.line([(px0, sy(0)), (px1, sy(0))], fill=AXIS, width=2)
    d.line([(sx(0), py0), (sx(0), py1)], fill=AXIS, width=2)
    a, b = cfg["a"], cfg["b"]
    d.line([(sx(cfg["xmin"]), sy(a * cfg["xmin"] + b)), (sx(cfg["xmax"]), sy(a * cfg["xmax"] + b))], fill=LINE, width=3)
    r = 4
    d.ellipse([sx(0) - r, sy(b) - r, sx(0) + r, sy(b) + r], fill=LINE)
    # sliders
    for i, (label, val, lo, hi) in enumerate([("Slope a", a, -5, 5), ("Intercept b", b, -10, 10)]):
        cx = 16 + i * (W // 2)
        d.text((cx, H - 58), f"{label}   {val:g}", fill=TEXT)
        d.line([(cx, H - 36), (cx + W // 2 - 48, H - 36)], fill=GRID, width=4)
        kx = cx + (val - lo) / (hi - lo) * (W // 2 - 48)
        d.ellipse([kx - 6, H - 42, kx + 6, H - 30], fill=LINE)
    d.text((16, H - 20), "y = 1·x + 0", fill="#f9c74f")


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "widgets" / "of-template" / "preview.png"
    img = Image.new("RGB", (W, H), CARD)
    draw_widget(img)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG")
    print(f"wrote {out} ({W}x{H})")


if __name__ == "__main__":
    main()
