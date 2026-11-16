#!/usr/bin/env python3
"""
Contrast checker for SAPA NAMBASO design tokens (WCAG AA).
Formula: (L1 + 0.05) / (L2 + 0.05)
"""
import math

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    srgb = [c / 255.0 for c in rgb]
    lum = []
    for c in srgb:
        if c <= 0.03928:
            lum.append(c / 12.92)
        else:
            lum.append(((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]

def contrast_ratio(hex1, hex2):
    l1 = relative_luminance(hex_to_rgb(hex1))
    l2 = relative_luminance(hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

# Primary color pairs in SAPA NAMBASO light & dark modes (actual tokens from styles.css)
PAIRS = [
    # ("Pair Name", "Foreground", "Background", "Min Ratio")
    ("Brand Primary (#075985) on White", "#075985", "#FFFFFF", 4.5), # 7.64:1
    ("Brand Primary on Light Tint", "#075985", "#F0F9FF", 4.5),
    ("Text Primary on White", "#0F172A", "#FFFFFF", 7.0),
    ("Text Secondary on White", "#334155", "#FFFFFF", 4.5),
    ("Button Accent Ink on Sky Bright", "#082F49", "#38BDF8", 4.5),
    ("WhatsApp Solid White Text", "#FFFFFF", "#15803D", 4.5),
    ("Status Open Ink on Green Tint", "#065F46", "#ECFDF5", 4.5),
    ("Status Closed Ink on Red Tint", "#991B1B", "#FEF2F2", 4.5),
    ("Dark Mode: Text Primary on Surface", "#F8FAFC", "#111E36", 7.0),
    ("Dark Mode: Brand Primary on Surface", "#7DD3FC", "#111E36", 4.5),
]

all_passed = True
print("SAPA NAMBASO WCAG AA Contrast Audit:\n")
for name, fg, bg, req in PAIRS:
    ratio = contrast_ratio(fg, bg)
    passed = ratio >= req
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name:30} : {ratio:5.2f}:1 (Required: {req:3.1f}:1) | FG: {fg} BG: {bg}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nAll color pairs meet WCAG AA standards!")
    exit(0)
else:
    print("\nSome color pairs failed WCAG AA standards.")
    exit(1)
