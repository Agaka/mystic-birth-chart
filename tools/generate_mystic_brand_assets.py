from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "marketing" / "brand"
SOCIAL_V2 = ROOT / "marketing" / "social-launch-v2"
HERO = ROOT / "public" / "images" / "birth-chart-reading-hero.png"
FONTS = Path("C:/Windows/Fonts")

GEORGIA = FONTS / "georgia.ttf"
GEORGIA_BOLD = FONTS / "georgiab.ttf"
GEORGIA_ITALIC = FONTS / "georgiai.ttf"
ARIAL_BOLD = FONTS / "arialbd.ttf"

DARK = (8, 6, 4)
INK = (28, 17, 12)
GOLD = (213, 166, 74)
GOLD_DEEP = (148, 103, 38)
IVORY = (247, 235, 213)
PARCHMENT = (236, 222, 194)
RED_BROWN = (77, 35, 27)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def polar(cx: float, cy: float, radius: float, degrees: float) -> tuple[float, float]:
    radians = math.radians(degrees - 90)
    return cx + math.cos(radians) * radius, cy + math.sin(radians) * radius


def scale_point(point: tuple[float, float], scale: int) -> tuple[int, int]:
    return round(point[0] * scale), round(point[1] * scale)


def draw_line(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[float, float]],
    fill: tuple[int, int, int, int],
    width: int,
    scale: int,
) -> None:
    draw.line([scale_point(p, scale) for p in points], fill=fill, width=width * scale, joint="curve")


def draw_circle(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    radius: float,
    outline: tuple[int, int, int, int],
    width: int,
    scale: int,
    fill: tuple[int, int, int, int] | None = None,
) -> None:
    box = [
        round((cx - radius) * scale),
        round((cy - radius) * scale),
        round((cx + radius) * scale),
        round((cy + radius) * scale),
    ]
    draw.ellipse(box, outline=outline, width=width * scale, fill=fill)


def draw_polygon(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[float, float]],
    outline: tuple[int, int, int, int],
    width: int,
    scale: int,
    fill: tuple[int, int, int, int] | None = None,
) -> None:
    draw.polygon([scale_point(p, scale) for p in points], outline=outline, fill=fill)
    draw.line([scale_point(p, scale) for p in points + [points[0]]], fill=outline, width=width * scale, joint="curve")


def draw_hermetic_mark(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], scale: int = 1) -> None:
    x1, y1, x2, y2 = box
    size = min(x2 - x1, y2 - y1)
    cx = x1 + size / 2
    cy = y1 + size / 2
    r = size * 0.42
    gold = (*GOLD, 245)
    soft = (*GOLD, 120)
    dim = (*GOLD_DEEP, 120)
    ivory = (*IVORY, 235)

    draw_circle(draw, cx, cy, r, gold, 5, scale)
    draw_circle(draw, cx, cy, r * 0.91, soft, 2, scale)
    draw_circle(draw, cx, cy, r * 0.71, dim, 2, scale)
    draw_circle(draw, cx, cy, r * 0.48, soft, 2, scale)

    for i in range(36):
        angle = i * 10
        long_tick = i % 3 == 0
        outer = polar(cx, cy, r, angle)
        inner = polar(cx, cy, r * (0.94 if long_tick else 0.975), angle)
        draw_line(draw, [inner, outer], gold if long_tick else soft, 2 if long_tick else 1, scale)

    for i in range(12):
        angle = i * 30
        outer = polar(cx, cy, r * 0.91, angle)
        inner = polar(cx, cy, r * 0.71, angle)
        draw_line(draw, [inner, outer], (*GOLD, 150), 2, scale)

    heptagon = [polar(cx, cy, r * 0.58, i * 360 / 7) for i in range(7)]
    for point in heptagon:
        draw_circle(draw, point[0], point[1], r * 0.027, ivory, 2, scale, fill=(*DARK, 190))

    for i in range(7):
        draw_line(draw, [heptagon[i], heptagon[(i + 3) % 7]], (*GOLD, 155), 2, scale)
    draw_polygon(draw, heptagon, (*GOLD, 95), 1, scale)

    triangle_up = [polar(cx, cy, r * 0.38, 0), polar(cx, cy, r * 0.38, 120), polar(cx, cy, r * 0.38, 240)]
    triangle_down = [polar(cx, cy, r * 0.38, 180), polar(cx, cy, r * 0.38, 300), polar(cx, cy, r * 0.38, 60)]
    diamond = [polar(cx, cy, r * 0.28, 0), polar(cx, cy, r * 0.28, 90), polar(cx, cy, r * 0.28, 180), polar(cx, cy, r * 0.28, 270)]
    draw_polygon(draw, triangle_up, (*GOLD, 210), 3, scale)
    draw_polygon(draw, triangle_down, (*GOLD, 155), 2, scale)
    draw_polygon(draw, diamond, (*IVORY, 190), 2, scale)

    draw_line(draw, [polar(cx, cy, r * 0.5, 0), polar(cx, cy, r * 0.5, 180)], (*IVORY, 170), 2, scale)
    draw_line(draw, [polar(cx, cy, r * 0.5, 90), polar(cx, cy, r * 0.5, 270)], (*IVORY, 125), 2, scale)
    draw_circle(draw, cx, cy, r * 0.12, (*IVORY, 230), 3, scale, fill=(*DARK, 145))
    draw_circle(draw, cx, cy, r * 0.04, gold, 2, scale, fill=(*GOLD, 230))

    top = polar(cx, cy, r * 0.78, 0)
    bottom = polar(cx, cy, r * 0.78, 180)
    draw_circle(draw, top[0], top[1], r * 0.045, (*IVORY, 210), 2, scale, fill=(*DARK, 125))
    draw_circle(draw, bottom[0], bottom[1], r * 0.045, (*GOLD, 210), 2, scale, fill=(*DARK, 125))


def make_mark_png(path: Path, size: int = 1400, transparent: bool = True) -> None:
    scale = 4
    bg = (0, 0, 0, 0) if transparent else (*DARK, 255)
    image = Image.new("RGBA", (size * scale, size * scale), bg)
    draw = ImageDraw.Draw(image)
    draw_hermetic_mark(draw, (70, 70, size - 70, size - 70), scale)
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def make_avatar(path: Path) -> None:
    size = 1080
    if HERO.exists():
        bg = Image.open(HERO).convert("RGB")
        bg = ImageOps.fit(bg, (size, size), method=Image.Resampling.LANCZOS, centering=(0.62, 0.52)).convert("RGBA")
    else:
        bg = Image.new("RGBA", (size, size), (*DARK, 255))

    shade = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    sd.rectangle([0, 0, size, size], fill=(0, 0, 0, 125))
    sd.ellipse([82, 82, size - 82, size - 82], fill=(5, 4, 3, 120), outline=(*GOLD, 220), width=6)
    bg = Image.alpha_composite(bg, shade)

    mark = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_hermetic_mark(ImageDraw.Draw(mark), (126, 126, size - 126, size - 126), 1)
    bg = Image.alpha_composite(bg, mark)
    path.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(path, quality=95, optimize=True)


def make_lockup(path: Path) -> None:
    w, h = 1800, 1000
    scale = 2
    image = Image.new("RGBA", (w * scale, h * scale), (*DARK, 255))
    pix = image.load()
    for y in range(h * scale):
        t = y / (h * scale)
        row = (
            round(DARK[0] * (1 - t) + 40 * t),
            round(DARK[1] * (1 - t) + 20 * t),
            round(DARK[2] * (1 - t) + 10 * t),
            255,
        )
        for x in range(w * scale):
            pix[x, y] = row
    draw = ImageDraw.Draw(image)

    draw_hermetic_mark(draw, (120, 170, 820, 870), scale)
    title = font(GEORGIA_BOLD, 116 * scale)
    sub = font(GEORGIA_ITALIC, 44 * scale)
    small = font(ARIAL_BOLD, 30 * scale)
    x = 900 * scale
    draw.text((x, 330 * scale), "Mystic", font=title, fill=IVORY)
    draw.text((x, 458 * scale), "Birth Chart", font=title, fill=IVORY)
    draw.line([(x, 620 * scale), (1560 * scale, 620 * scale)], fill=(*GOLD, 205), width=2 * scale)
    draw.text((x, 650 * scale), "Traditional astrology. Hermetic study.", font=sub, fill=GOLD)
    draw.text((x, 735 * scale), "MYSTICBIRTHCHART.COM", font=small, fill=(198, 157, 80))

    image = image.resize((w, h), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, quality=95, optimize=True)


def make_preview_board(path: Path) -> None:
    w, h = 1800, 1400
    image = Image.new("RGB", (w, h), (236, 225, 204))
    draw = ImageDraw.Draw(image)
    draw.rectangle([0, 0, w, h], fill=(235, 223, 201))
    draw.text((90, 80), "Mystic Birth Chart - Hermetic Astrolabe Seal", font=font(GEORGIA_BOLD, 62), fill=RED_BROWN)
    draw.text((92, 160), "No monogram. Astrology wheel, decans, seven planets, and Hermetic geometry.", font=font(GEORGIA, 34), fill=INK)

    dark_panel = Image.new("RGBA", (760, 760), (*DARK, 255))
    d_dark = ImageDraw.Draw(dark_panel)
    draw_hermetic_mark(d_dark, (70, 70, 690, 690), 1)
    image.paste(dark_panel.convert("RGB"), (90, 250))

    light_panel = Image.new("RGBA", (760, 760), (*PARCHMENT, 255))
    d_light = ImageDraw.Draw(light_panel)
    draw_hermetic_mark(d_light, (70, 70, 690, 690), 1)
    image.paste(light_panel.convert("RGB"), (950, 250))

    avatar = Image.open(OUT / "profile-avatar.png").convert("RGB").resize((280, 280), Image.Resampling.LANCZOS)
    image.paste(avatar, (90, 1070))
    draw.text((410, 1115), "Profile avatar", font=font(GEORGIA_BOLD, 44), fill=RED_BROWN)
    draw.text((410, 1172), "Works without text at small size.", font=font(GEORGIA, 32), fill=INK)
    draw.text((950, 1115), "Public domain", font=font(GEORGIA_BOLD, 44), fill=RED_BROWN)
    draw.text((950, 1172), "mysticbirthchart.com", font=font(GEORGIA, 36), fill=INK)
    image.save(path, quality=95, optimize=True)


def make_app_icons() -> None:
    app_dir = ROOT / "src" / "app"
    icon_rgba = Image.open(OUT / "profile-avatar.png").convert("RGBA")
    icon_rgb = icon_rgba.convert("RGB")
    icon_rgb.save(app_dir / "icon.png", quality=95, optimize=True)
    icon_rgb.resize((180, 180), Image.Resampling.LANCZOS).save(app_dir / "apple-icon.png", quality=95, optimize=True)

    favicon_sizes = [(16, 16), (32, 32), (48, 48)]
    favicons = [icon_rgba.resize(size, Image.Resampling.LANCZOS) for size in favicon_sizes]
    favicons[0].save(app_dir / "favicon.ico", sizes=favicon_sizes)


def make_svg(path: Path) -> None:
    cx = cy = 600
    r = 430

    def p(radius: float, deg: float) -> tuple[float, float]:
        return polar(cx, cy, radius, deg)

    lines: list[str] = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-labelledby="title desc">',
        "<title>Mystic Birth Chart Hermetic Astrolabe Seal</title>",
        "<desc>Original astrology and hermetic seal mark with zodiac divisions, decan ticks, seven planetary points, heptagram, and nested alchemical geometry.</desc>",
        "<defs>",
        '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2d089"/><stop offset="0.48" stop-color="#d5a64a"/><stop offset="1" stop-color="#90672b"/></linearGradient>',
        '<style>.a{fill:none;stroke:url(#gold);stroke-linecap:round;stroke-linejoin:round}.b{fill:#080604;stroke:url(#gold);stroke-linecap:round;stroke-linejoin:round}.c{fill:#f7ebd5;stroke:url(#gold);stroke-linecap:round;stroke-linejoin:round}</style>',
        "</defs>",
        '<g class="a">',
        f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke-width="10"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r * 0.91:.2f}" stroke-width="4" opacity="0.75"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r * 0.71:.2f}" stroke-width="4" opacity="0.55"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r * 0.48:.2f}" stroke-width="4" opacity="0.7"/>',
    ]
    for i in range(36):
        angle = i * 10
        long_tick = i % 3 == 0
        x1, y1 = p(r * (0.94 if long_tick else 0.975), angle)
        x2, y2 = p(r, angle)
        lines.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" stroke-width="{4 if long_tick else 2}" opacity="{0.95 if long_tick else 0.55}"/>')
    for i in range(12):
        x1, y1 = p(r * 0.71, i * 30)
        x2, y2 = p(r * 0.91, i * 30)
        lines.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" stroke-width="3" opacity="0.75"/>')

    hept = [p(r * 0.58, i * 360 / 7) for i in range(7)]
    for i in range(7):
        x1, y1 = hept[i]
        x2, y2 = hept[(i + 3) % 7]
        lines.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" stroke-width="4" opacity="0.72"/>')
    hept_path = " ".join(f"{x:.2f},{y:.2f}" for x, y in hept)
    lines.append(f'<polygon points="{hept_path}" stroke-width="2" opacity="0.55"/>')
    for x, y in hept:
        lines.append(f'<circle class="b" cx="{x:.2f}" cy="{y:.2f}" r="13" stroke-width="3"/>')

    up = " ".join(f"{x:.2f},{y:.2f}" for x, y in [p(r * 0.38, 0), p(r * 0.38, 120), p(r * 0.38, 240)])
    down = " ".join(f"{x:.2f},{y:.2f}" for x, y in [p(r * 0.38, 180), p(r * 0.38, 300), p(r * 0.38, 60)])
    diamond = " ".join(f"{x:.2f},{y:.2f}" for x, y in [p(r * 0.28, 0), p(r * 0.28, 90), p(r * 0.28, 180), p(r * 0.28, 270)])
    lines.extend(
        [
            f'<polygon points="{up}" stroke-width="6" opacity="0.92"/>',
            f'<polygon points="{down}" stroke-width="4" opacity="0.72"/>',
            f'<polygon points="{diamond}" stroke-width="4" opacity="0.78"/>',
            f'<path d="M{p(r * 0.5, 0)[0]:.2f} {p(r * 0.5, 0)[1]:.2f} L{p(r * 0.5, 180)[0]:.2f} {p(r * 0.5, 180)[1]:.2f}" stroke-width="4" opacity="0.72"/>',
            f'<path d="M{p(r * 0.5, 90)[0]:.2f} {p(r * 0.5, 90)[1]:.2f} L{p(r * 0.5, 270)[0]:.2f} {p(r * 0.5, 270)[1]:.2f}" stroke-width="4" opacity="0.55"/>',
            f'<circle class="b" cx="{cx}" cy="{cy}" r="{r * 0.12:.2f}" stroke-width="5"/>',
            f'<circle class="c" cx="{cx}" cy="{cy}" r="{r * 0.04:.2f}" stroke-width="3"/>',
        ]
    )
    for deg in (0, 180):
        x, y = p(r * 0.78, deg)
        lines.append(f'<circle class="b" cx="{x:.2f}" cy="{y:.2f}" r="{r * 0.045:.2f}" stroke-width="4"/>')
    lines.extend(["</g>", "</svg>"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_svg(OUT / "mystic-astrolabe-seal.svg")
    make_mark_png(OUT / "mystic-astrolabe-seal-transparent.png", transparent=True)
    make_mark_png(OUT / "mystic-astrolabe-seal-dark.png", transparent=False)
    make_avatar(OUT / "profile-avatar.png")
    make_lockup(OUT / "logo-lockup-dark.png")
    make_preview_board(OUT / "logo-preview-board.jpg")
    make_app_icons()

    SOCIAL_V2.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(OUT / "profile-avatar.png", SOCIAL_V2 / "profile-avatar.png")


if __name__ == "__main__":
    main()
