from __future__ import annotations

import math
import random
import shutil
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "marketing" / "social-launch-v2"
HERO = ROOT / "public" / "images" / "birth-chart-reading-hero.png"
BRAND_AVATAR = ROOT / "marketing" / "brand" / "profile-avatar.png"
PUBLIC_DOMAIN = "mysticbirthchart.com"
FREE_CHART_URL = f"{PUBLIC_DOMAIN}/free-birth-chart"

FONTS = Path("C:/Windows/Fonts")
GEORGIA = FONTS / "georgia.ttf"
GEORGIA_BOLD = FONTS / "georgiab.ttf"
GEORGIA_ITALIC = FONTS / "georgiai.ttf"
ARIAL = FONTS / "arial.ttf"
ARIAL_BOLD = FONTS / "arialbd.ttf"

INK = (31, 18, 14)
DARK = (8, 6, 4)
PAPER = (238, 225, 198)
PAPER_DARK = (205, 185, 149)
GOLD = (188, 138, 57)
GOLD_LIGHT = (226, 184, 102)
RED_BROWN = (72, 35, 26)
MUTED = (90, 63, 44)
IVORY = (246, 235, 213)


POSTS = [
    {
        "slug": "chart-grammar",
        "label": "OLD STUDY METHOD",
        "title": "Your chart has a grammar.",
        "subtitle": "Most astrology content teaches vocabulary. A reading teaches syntax.",
        "caption": (
            "Most astrology content teaches vocabulary: Sun, Moon, Rising, Venus, Mars. Useful, but incomplete.\n\n"
            "A serious reading studies syntax: chart ruler, houses, sect, dignity, aspects, and repeated themes. "
            "That is why two people with the same placement can live very different charts.\n\n"
            "Start with the free chart snapshot, then order a hand-prepared reading when you want the whole chart read.\n\n"
            "#birthchart #traditionalastrology #natalchart #astrologyreading #chartreading #astrology101 #risingsign #hermeticastrology"
        ),
        "slides": [
            ("Your chart has a grammar.", "Most astrology content teaches vocabulary. A reading teaches syntax."),
            ("Vocabulary names the parts.", "Sun in Virgo. Moon in Pisces. Venus in Leo. Useful names, but still only labels."),
            ("Syntax shows the pattern.", "Who rules the Ascendant? Which house is emphasized? Which planet can act? Which aspect keeps repeating?"),
            ("The old method has order.", "Ascendant, chart ruler, sect, dignity, houses, aspects, timing. The chart is read as a structure."),
            ("This is why readings differ.", "Two people can share one placement and live it differently because the placement belongs to a different chart."),
            ("Start with the pattern.", "Use the free birth chart snapshot. Order a hand-prepared reading when you want the whole chart interpreted."),
        ],
    },
    {
        "slug": "ascendant-door",
        "label": "ASCENDANT",
        "title": "The Rising sign is the front door.",
        "subtitle": "Not a costume. Not a vibe. It opens the entire house system.",
        "caption": (
            "The Rising sign is not just a first impression.\n\n"
            "In traditional astrology, the Ascendant opens the houses and points to the chart ruler. "
            "That ruler becomes one of the first threads in the reading.\n\n"
            "If your birth time is accurate, this is where the chart starts to become specific.\n\n"
            "Free chart snapshot through the link in bio.\n\n"
            "#risingsign #birthchart #traditionalastrology #natalchart #astrologyreading #ascendant #chartreading #astrology101"
        ),
        "slides": [
            ("The Rising sign is the front door.", "Not a costume. Not a vibe. It opens the entire house system."),
            ("It decides where life happens.", "The houses describe body, money, home, love, work, vocation, secrets, and practice."),
            ("It points to the chart ruler.", "Virgo Rising follows Mercury. Libra Rising follows Venus. Capricorn Rising follows Saturn."),
            ("The ruler carries the story.", "Its sign, house, condition, and aspects show how the chart begins to move."),
            ("Birth time matters here.", "A few hours can change the Ascendant, the houses, and the main path of interpretation."),
            ("Begin at the doorway.", "Use the free chart snapshot, then order a reading when you want the full synthesis."),
        ],
    },
    {
        "slug": "magic-chart",
        "label": "HERMETIC ASTROLOGY",
        "title": "Magic without the chart becomes decoration.",
        "subtitle": "The work belongs to planets, signs, decans, houses, and timing.",
        "caption": (
            "Hermetic astrology should not be random occult spectacle.\n\n"
            "The practice becomes serious when it stays tied to planets, signs, decans, houses, and timing. "
            "Decan angel work, for example, is best approached as a structured practice for inner formation: "
            "confidence, discipline, intuition, courage, joy, and spiritual focus.\n\n"
            "Begin with the chart. Link in bio.\n\n"
            "#hermeticastrology #traditionalastrology #decanangels #birthchart #natalchart #westernesotericism #astrologyreading #planetarymagic"
        ),
        "slides": [
            ("Magic without the chart becomes decoration.", "The work belongs to planets, signs, decans, houses, and timing."),
            ("The chart gives the boundary.", "A practice belongs here only when it can be traced through the sky."),
            ("Decans make it specific.", "Each ten-degree section of the zodiac carries a different symbolic emphasis."),
            ("Angelic work is not a vending machine.", "The realistic promise is inner formation: confidence, courage, discipline, joy, intuition, patience."),
            ("The same practice is not for everyone.", "The natal chart shows which planet, house, decan, and timing are personally relevant."),
            ("Study first. Practice with structure.", "Begin with the birth chart, then build the ritual work from the sky itself."),
        ],
    },
]


def f(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def fit_text(draw: ImageDraw.ImageDraw, text: str, font_path: Path, max_size: int, min_size: int, width: int) -> ImageFont.FreeTypeFont:
    for size in range(max_size, min_size - 1, -2):
        font = f(font_path, size)
        if max((draw.textbbox((0, 0), line, font=font)[2] for line in wrap(draw, text, font, width)), default=0) <= width:
            return font
    return f(font_path, min_size)


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        current = ""
        for word in words:
            test = f"{current} {word}".strip()
            if draw.textbbox((0, 0), test, font=font)[2] <= max_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] | tuple[int, int, int, int],
    max_width: int,
    gap: int,
) -> int:
    for line in wrap(draw, text, font, max_width):
        draw.text((x, y), line, font=font, fill=fill)
        box = draw.textbbox((x, y), line, font=font)
        y += box[3] - box[1] + gap
    return y


def study_background(size: tuple[int, int], seed: int, center: tuple[float, float] = (0.64, 0.54)) -> Image.Image:
    random.seed(seed)
    if HERO.exists():
        image = Image.open(HERO).convert("RGB")
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=center)
    else:
        image = Image.new("RGB", size, DARK)

    w, h = size
    shade = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(shade)
    d.rectangle([0, 0, w, h], fill=(10, 5, 2, 88))
    d.rectangle([0, 0, int(w * 0.44), h], fill=(0, 0, 0, 95))
    for r in range(int(math.hypot(w, h)), 0, -22):
        alpha = int(215 * (1 - r / math.hypot(w, h)) ** 1.5)
        d.ellipse([w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r], outline=(0, 0, 0, alpha), width=34)
    image = Image.alpha_composite(image.convert("RGBA"), shade)

    noise = Image.new("L", size)
    pix = noise.load()
    for y in range(h):
        for x in range(w):
            pix[x, y] = random.randint(0, 35)
    grain = Image.merge("RGBA", (noise, noise, noise, noise.point(lambda p: int(p * 0.24))))
    return Image.alpha_composite(image, grain).convert("RGBA")


def paper_texture(size: tuple[int, int], seed: int) -> Image.Image:
    random.seed(seed)
    w, h = size
    base = Image.new("RGBA", size, (*PAPER, 242))
    d = ImageDraw.Draw(base)

    wash = Image.new("RGBA", size, (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for _ in range(38):
        x = random.randint(-120, w)
        y = random.randint(-80, h)
        rw = random.randint(90, 330)
        rh = random.randint(45, 190)
        tone = random.choice([(132, 88, 43), (245, 230, 190), (98, 61, 28)])
        wd.ellipse([x, y, x + rw, y + rh], fill=(*tone, random.randint(4, 13)))
    wash = wash.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(wash)

    for _ in range(260):
        x = random.randrange(w)
        y = random.randrange(h)
        tone = random.randint(-16, 14)
        color = (
            max(0, min(255, PAPER[0] + tone)),
            max(0, min(255, PAPER[1] + tone)),
            max(0, min(255, PAPER[2] + tone)),
            random.randint(8, 24),
        )
        d.point((x, y), fill=color)

    edge = Image.new("RGBA", size, (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge)
    for inset in range(0, 26, 2):
        alpha = int(34 * (1 - inset / 28))
        ed.rectangle([inset, inset, w - inset - 1, h - inset - 1], outline=(89, 49, 22, alpha), width=2)
    base.alpha_composite(edge.filter(ImageFilter.GaussianBlur(1.3)))
    return base.filter(ImageFilter.GaussianBlur(0.15))


def paste_panel(canvas: Image.Image, box: tuple[int, int, int, int], seed: int) -> ImageDraw.ImageDraw:
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    panel = paper_texture((w, h), seed)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rectangle([x1 + 16, y1 + 18, x2 + 16, y2 + 18], fill=(0, 0, 0, 105))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(panel, (x1, y1))
    d = ImageDraw.Draw(canvas)
    d.rectangle([x1, y1, x2, y2], outline=(95, 58, 30, 180), width=2)
    d.rectangle([x1 + 22, y1 + 22, x2 - 22, y2 - 22], outline=(95, 58, 30, 62), width=1)
    return d


def chart_mark(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, alpha: int = 110) -> None:
    color = (*GOLD, alpha)
    for scale, width in [(1.0, 2), (0.78, 1), (0.52, 1), (0.3, 1)]:
        r = radius * scale
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=width)
    for i in range(12):
        a = math.radians(i * 30 - 90)
        draw.line(
            [
                (cx + math.cos(a) * radius * 0.3, cy + math.sin(a) * radius * 0.3),
                (cx + math.cos(a) * radius, cy + math.sin(a) * radius),
            ],
            fill=(*GOLD, int(alpha * 0.55)),
            width=1,
        )
    for i in [0, 2, 5, 7, 9]:
        a = math.radians(i * 30 - 90)
        b = math.radians(((i + 4) % 12) * 30 - 90)
        draw.line(
            [
                (cx + math.cos(a) * radius * 0.45, cy + math.sin(a) * radius * 0.45),
                (cx + math.cos(b) * radius * 0.45, cy + math.sin(b) * radius * 0.45),
            ],
            fill=(*GOLD, int(alpha * 0.4)),
            width=1,
        )


def footer(draw: ImageDraw.ImageDraw, w: int, h: int, index: int | None = None) -> None:
    small = f(ARIAL_BOLD, 20)
    serif = f(GEORGIA, 19)
    draw.line([(72, h - 98), (w - 72, h - 98)], fill=(*GOLD_LIGHT, 130), width=1)
    draw.text((72, h - 72), "MYSTIC BIRTH CHART", font=small, fill=GOLD_LIGHT)
    draw.text((72, h - 44), "Traditional astrology, read slowly.", font=serif, fill=IVORY)
    if index is not None:
        txt = f"PLATE {index:02d}"
        box = draw.textbbox((0, 0), txt, font=small)
        draw.text((w - 72 - (box[2] - box[0]), h - 72), txt, font=small, fill=GOLD_LIGHT)


def make_slide(post: dict, slide_index: int, title: str, body: str, out_path: Path) -> None:
    w = h = 1080
    canvas = study_background((w, h), seed=1100 + slide_index + len(post["slug"]) * 11)
    d = ImageDraw.Draw(canvas)
    chart_mark(d, 890, 178, 132, 80)
    chart_mark(d, 182, 862, 118, 44)

    if slide_index == 1:
        panel = (74, 92, 826, 755)
        paste_panel(canvas, panel, seed=200 + slide_index)
        d = ImageDraw.Draw(canvas)
        d.text((122, 140), post["label"], font=f(ARIAL_BOLD, 22), fill=GOLD)
        title_font = fit_text(d, title, GEORGIA_BOLD, 70, 48, 620)
        y = draw_wrapped(d, 122, 212, title, title_font, RED_BROWN, 620, 12)
        y += 26
        y = draw_wrapped(d, 122, y, body, f(GEORGIA, 33), INK, 610, 14)
        d.line([(122, 650), (344, 650)], fill=(120, 75, 42, 110), width=1)
        d.text((122, 674), "a note from the reading table", font=f(GEORGIA_ITALIC, 24), fill=MUTED)
    else:
        panel = (118, 126, 962, 806)
        paste_panel(canvas, panel, seed=200 + slide_index)
        d = ImageDraw.Draw(canvas)
        d.text((166, 174), post["label"], font=f(ARIAL_BOLD, 20), fill=GOLD)
        d.text((166, 214), f"Study {slide_index}", font=f(GEORGIA_ITALIC, 22), fill=MUTED)
        title_font = fit_text(d, title, GEORGIA_BOLD, 58, 42, 720)
        y = draw_wrapped(d, 166, 278, title, title_font, RED_BROWN, 720, 10)
        y += 24
        y = draw_wrapped(d, 166, y, body, f(GEORGIA, 33), INK, 700, 14)
        d.line([(166, 718), (324, 718)], fill=(120, 75, 42, 115), width=1)
        d.text((166, 740), "Read the whole chart, not the isolated trait.", font=f(GEORGIA_ITALIC, 22), fill=MUTED)

    footer(d, w, h, slide_index)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, quality=95, optimize=True)


def make_pin(post: dict, out_path: Path) -> None:
    w, h = 1000, 1500
    canvas = study_background((w, h), seed=3300 + len(post["slug"]) * 9, center=(0.66, 0.52))
    d = ImageDraw.Draw(canvas)
    chart_mark(d, 780, 214, 166, 86)
    panel = (76, 110, 924, 1110)
    paste_panel(canvas, panel, seed=554)
    d = ImageDraw.Draw(canvas)
    d.text((132, 170), post["label"], font=f(ARIAL_BOLD, 23), fill=GOLD)
    title_font = fit_text(d, post["title"], GEORGIA_BOLD, 72, 50, 700)
    y = draw_wrapped(d, 132, 246, post["title"], title_font, RED_BROWN, 700, 14)
    y += 34
    y = draw_wrapped(d, 132, y, post["subtitle"], f(GEORGIA, 38), INK, 700, 16)
    y += 54
    d.rectangle([132, y, 760, y + 82], fill=(*RED_BROWN, 235), outline=(*GOLD, 180), width=2)
    d.text((164, y + 24), "Free birth chart snapshot", font=f(ARIAL_BOLD, 28), fill=IVORY)
    d.text((132, 1018), PUBLIC_DOMAIN, font=f(GEORGIA_ITALIC, 27), fill=MUTED)
    footer(d, w, h, None)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, quality=95, optimize=True)


def make_avatar(out_path: Path) -> None:
    if BRAND_AVATAR.exists():
        out_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(BRAND_AVATAR, out_path)
        return

    size = 1080
    canvas = study_background((size, size), seed=888, center=(0.62, 0.52))
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.ellipse([118, 118, size - 118, size - 118], fill=(11, 7, 4, 170), outline=(*GOLD_LIGHT, 230), width=5)
    d.ellipse([174, 174, size - 174, size - 174], outline=(*GOLD, 145), width=2)
    chart_mark(d, size // 2, size // 2, 300, 116)
    title = f(GEORGIA_ITALIC, 315)
    letter = "M"
    box = d.textbbox((0, 0), letter, font=title)
    d.text(((size - (box[2] - box[0])) / 2 - 8, 318), letter, font=title, fill=IVORY)
    d.line([(360, 710), (720, 710)], fill=(*GOLD_LIGHT, 170), width=2)
    d.text((371, 736), "MYSTIC BIRTH CHART", font=f(ARIAL_BOLD, 26), fill=GOLD_LIGHT)
    canvas = Image.alpha_composite(canvas, overlay)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, quality=95, optimize=True)


def write_captions(path: Path) -> None:
    bio = (
        "Instagram bio preview:\n"
        "Traditional astrology, read slowly.\n"
        "Natal charts + Hermetic study.\n"
        f"Free chart + readings: {PUBLIC_DOMAIN}\n\n"
        "Pinterest about preview:\n"
        "Traditional astrology for serious chart readers. Natal chart synthesis, Hermetic astrology, decans, planetary timing, and hand-prepared readings.\n\n"
    )
    lines = ["# Mystic Birth Chart Social Launch V2", "", bio]
    for i, post in enumerate(POSTS, 1):
        lines.append(f"## Post {i}: {post['title']}")
        lines.append("")
        lines.append(post["caption"])
        lines.append("")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    make_avatar(OUT / "profile-avatar.png")
    for post_i, post in enumerate(POSTS, 1):
        for slide_i, (title, body) in enumerate(post["slides"], 1):
            make_slide(
                post,
                slide_i,
                title,
                body,
                OUT / "instagram" / f"post-{post_i:02d}-{post['slug']}" / f"slide-{slide_i:02d}.jpg",
            )
        make_pin(post, OUT / "pinterest" / f"pin-{post_i:02d}-{post['slug']}.jpg")
    write_captions(OUT / "captions.md")


if __name__ == "__main__":
    main()
