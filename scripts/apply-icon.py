#!/usr/bin/env python3
"""
Heat It Up - App Icon Switcher and Asset Generator
Usage:
    python3 scripts/apply-icon.py [1|2|3|4|5|6]
"""

import sys
import os
from PIL import Image

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")
ICONS_DIR = os.path.join(ASSETS_DIR, "icons")

ICON_OPTIONS = {
    "1": ("1_flame_heart_intimacy.jpg", "Intim láng-szív (Sensual Intertwined Flame Ribbon Heart)"),
    "2": ("2_masquerade_swinger_party.jpg", "Velencei maszk és parázs (Masquerade Swinger Party & Embers)"),
    "3": ("3_neon_spade_flame.jpg", "Modern neon pikk és lángkorona (Modern Neon Swinger Spade & Flame)"),
    "4": ("4_neon_spade_badge.jpg", "Neon pikk kontúr jelvény (Neon Spade Line-art Badge)"),
    "5": ("5_masquerade_badge.jpg", "Maszk jelvény mockup (Masquerade Squircle Tile)"),
    "6": ("6_flame_badge.jpg", "Glossy láng jelvény mockup (Glossy 3D Flame Tile)")
}

def apply_icon(choice="1"):
    if choice not in ICON_OPTIONS:
        print(f"Érvénytelen választás: {choice}. Elérhető opciók: {list(ICON_OPTIONS.keys())}")
        return False

    filename, desc = ICON_OPTIONS[choice]
    source_path = os.path.join(ICONS_DIR, filename)

    if not os.path.exists(source_path):
        print(f"Hiba: {source_path} nem található!")
        return False

    print(f"-> Kiválasztott ikon: [{choice}] {desc}")
    img = Image.open(source_path).convert("RGBA")

    # 1. Standard App Store / iOS icon (1024x1024 PNG)
    icon_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save(os.path.join(ASSETS_DIR, "icon.png"), "PNG")

    # 2. Android Adaptive Icon (1024x1024 PNG with center safe-zone)
    bg_color = (19, 13, 24, 255) # #130D18
    adaptive = Image.new("RGBA", (1024, 1024), bg_color)
    scaled = img.resize((740, 740), Image.Resampling.LANCZOS)
    offset = ((1024 - 740) // 2, (1024 - 740) // 2)
    adaptive.paste(scaled, offset)
    adaptive.save(os.path.join(ASSETS_DIR, "adaptive-icon.png"), "PNG")

    # 3. Favicon (48x48 PNG)
    favicon = img.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(ASSETS_DIR, "favicon.png"), "PNG")

    # 4. Splash Screen (1242x2688 PNG)
    splash = Image.new("RGBA", (1242, 2688), bg_color)
    splash_emblem = img.resize((600, 600), Image.Resampling.LANCZOS)
    splash_offset = ((1242 - 600) // 2, (2688 - 600) // 2)
    splash.paste(splash_emblem, splash_offset)
    splash.save(os.path.join(ASSETS_DIR, "splash.png"), "PNG")

    print(" Sikeresen generálva és beállítva:")
    print("  - assets/icon.png (iOS / App Store 1024x1024)")
    print("  - assets/adaptive-icon.png (Android adaptív ikon)")
    print("  - assets/splash.png (Indítóképernyő)")
    print("  - assets/favicon.png (Web favicon)")
    return True

if __name__ == "__main__":
    choice = sys.argv[1] if len(sys.argv) > 1 else "1"
    apply_icon(choice)
