"""Convert the portrait pipeline between WebP and PNG.

Usage: image-convert.py <src> <dst> [--max <px>] [--quality <q>]

The destination extension picks the format. --max bounds the long edge, so a
2K generation can be stored at the 1536 px the skin actually needs.
"""
import sys
from pathlib import Path

from PIL import Image

args = sys.argv[1:]
if len(args) < 2:
    raise SystemExit(__doc__)

src, dst = Path(args[0]), Path(args[1])
max_px = None
quality = 88
i = 2
while i < len(args):
    if args[i] == "--max":
        max_px = int(args[i + 1])
        i += 2
    elif args[i] == "--quality":
        quality = int(args[i + 1])
        i += 2
    else:
        raise SystemExit(f"unknown argument {args[i]}")

image = Image.open(src)
if image.mode not in ("RGB", "RGBA"):
    image = image.convert("RGB")

if max_px is not None:
    width, height = image.size
    scale = max_px / max(width, height)
    if scale < 1:
        image = image.resize((round(width * scale), round(height * scale)), Image.LANCZOS)

suffix = dst.suffix.lower()
if suffix == ".webp":
    image.save(dst, "WEBP", quality=quality, method=6)
elif suffix in (".png", ".jpg", ".jpeg"):
    image.save(dst)
else:
    raise SystemExit(f"unsupported destination {dst}")

print(f"{src.name} -> {dst.name} {image.size[0]}x{image.size[1]}")
