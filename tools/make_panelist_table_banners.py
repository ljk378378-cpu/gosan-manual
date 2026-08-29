from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "성과공유회" / "토론자_이름명패"
OUT.mkdir(parents=True, exist_ok=True)

# 400 x 700mm at 150dpi. PDF pages retain the exact physical dimensions.
W, H = 2362, 4134
PAGE_W, PAGE_H = 400 * mm, 700 * mm
FONT_DIR = Path("/Users/ijingyu/Library/Fonts")
FONT_REG = FONT_DIR / "Pretendard-Regular.otf"
FONT_MED = FONT_DIR / "Pretendard-Medium.otf"
FONT_BOLD = FONT_DIR / "Pretendard-Bold.otf"
FONT_XB = FONT_DIR / "Pretendard-ExtraBold.otf"
FONT_BLACK = FONT_DIR / "Pretendard-Black.otf"
BRAND = ROOT / "output" / "성과공유회" / "assets" / "폼보드_브랜드"

DEEP = "#075B4A"
GREEN = "#07846C"
TEAL = "#0CA58B"
LIME = "#B7D93B"
YELLOW = "#F2C94C"
INK = "#173A32"
GRAY = "#52675F"
PAPER = "#FCFCF8"
MIST = "#EDF5F1"

PANELISTS = [
    {
        "name": "배영미",
        "organization": "대구광역시환경교육센터",
        "title": "팀장",
        "role": "토론자",
        "rail": "성과확산",
        "rail_en": "ROUND TABLE",
        "accent": LIME,
    },
    {
        "name": "전희택",
        "organization": "제로웨이스트협동조합 세바퀴",
        "title": "대표",
        "role": "토론자",
        "rail": "성과확산",
        "rail_en": "ROUND TABLE",
        "accent": TEAL,
    },
    {
        "name": "허그림",
        "organization": "숲과나눔재단",
        "title": "캠페이너",
        "role": "토론자",
        "rail": "성과확산",
        "rail_en": "ROUND TABLE",
        "accent": YELLOW,
    },
    {
        "name": "이진규",
        "organization": "청곡종합사회복지관",
        "title": "과장",
        "role": "사회자",
        "rail": "토론진행",
        "rail_en": "MODERATOR",
        "accent": "#3B8798",
    },
]


def font(path, size):
    return ImageFont.truetype(str(path), size=size)


def centered(draw, xy, value, fnt, fill):
    draw.text(xy, value, font=fnt, fill=fill, anchor="mm")


def vertical_text(draw, x, y, value, fnt, fill, gap=16, center=True):
    boxes = [draw.textbbox((0, 0), ch, font=fnt) for ch in value]
    heights = [box[3] - box[1] for box in boxes]
    total = sum(heights) + gap * (len(value) - 1)
    cursor = y - total / 2 if center else y
    for ch, h in zip(value, heights):
        draw.text((x, cursor), ch, font=fnt, fill=fill, anchor="ma")
        cursor += h + gap


def paste_logo(base, path, box):
    x, y, w, h = box
    src = Image.open(path).convert("RGBA")
    alpha_box = src.getchannel("A").getbbox()
    if alpha_box:
        src = src.crop(alpha_box)
    thumb = ImageOps.contain(src, (w, h), Image.Resampling.LANCZOS)
    base.paste(
        thumb,
        (x + (w - thumb.width) // 2, y + (h - thumb.height) // 2),
        thumb.getchannel("A"),
    )


def make_banner(panelist):
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    accent = panelist["accent"]

    # Header: role first, readable across the hall.
    draw.rectangle((0, 0, W, 690), fill=DEEP)
    draw.rectangle((0, 0, 38, 690), fill=accent)
    centered(draw, (W // 2, 145), "주민이 Green 고산 3개년 성과공유회", font(FONT_MED, 76), "#DDEDE6")
    role = panelist["role"]
    role_label = role
    role_size = 215 if role == "토론자" else 235
    centered(draw, (W // 2, 420), role_label, font(FONT_BLACK, role_size), "#FFFFFF")
    draw.rectangle((W // 2 - 150, 612, W // 2 + 150, 632), fill=accent)

    # Body: name is the dominant vertical visual; affiliation is a quiet side column.
    draw.rectangle((0, 690, W, 3380), fill=PAPER)
    draw.rounded_rectangle((180, 865, 470, 3060), radius=145, fill=MIST)
    vertical_text(draw, 325, 1960, panelist["rail"], font(FONT_BOLD, 102), GREEN, gap=32)

    vertical_text(draw, 1110, 1940, panelist["name"], font(FONT_BLACK, 420), INK, gap=88)
    draw.rectangle((1515, 1030, 1530, 2865), fill=accent)
    if panelist.get("context"):
        centered(draw, (1790, 950), panelist["context"], font(FONT_BOLD, 72), GREEN)
    if panelist["organization"]:
        vertical_text(draw, 1735, 1910, panelist["organization"], font(FONT_BOLD, 90), GRAY, gap=14)
    title_x = 2020 if panelist["organization"] else 1790
    vertical_text(draw, title_x, 1910, panelist["title"], font(FONT_XB, 128), DEEP, gap=30)

    # Bottom: stage message above a quiet, form-board-style signature footer.
    draw.rectangle((0, 3380, W, 3800), fill=DEEP)
    draw.polygon([(0, 3380), (670, 3380), (0, 3850)], fill=GREEN)
    draw.polygon([(W, 3380), (1690, 3380), (W, 3850)], fill=accent)
    centered(draw, (W // 2, 3510), "성과 확산 라운드테이블", font(FONT_XB, 92), "#FFFFFF")
    centered(draw, (W // 2, 3645), "고산에서 시작한 변화, 수성구의 다음 실천으로", font(FONT_MED, 56), "#DDEDE6")

    draw.rectangle((0, 3800, W, H), fill="#FFFFFF")
    draw.line((115, 3800, W - 115, 3800), fill="#D7E5DE", width=4)
    paste_logo(image, BRAND / "logo_green_gosan_original.png", (W // 2 - 325, 3835, 650, 245))

    return image


def save_pdf(images, path):
    pdf = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    for i, image in enumerate(images):
        temp = OUT / f".pdf_page_{i}.jpg"
        image.save(temp, quality=97, subsampling=0, dpi=(150, 150))
        pdf.drawImage(str(temp), 0, 0, width=PAGE_W, height=PAGE_H)
        pdf.showPage()
        temp.unlink(missing_ok=True)
    pdf.save()


def make_overview(images, filename, title):
    gap = 45
    thumb_w = 620
    thumb_h = round(thumb_w * H / W)
    overview = Image.new("RGB", (thumb_w * len(images) + gap * (len(images) + 1), thumb_h + 250), "#E8EEE9")
    draw = ImageDraw.Draw(overview)
    centered(draw, (overview.width // 2, 72), title, font(FONT_XB, 66), DEEP)
    centered(draw, (overview.width // 2, 145), "실제 제작규격 각 400 x 700mm", font(FONT_MED, 35), GRAY)
    for i, image in enumerate(images):
        thumb = image.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        overview.paste(thumb, (gap + i * (thumb_w + gap), 205))
    overview.save(OUT / filename, quality=94)


def main():
    images = []
    for index, panelist in enumerate(PANELISTS, start=1):
        image = make_banner(panelist)
        images.append(image)
        affiliation = panelist["organization"] or panelist.get("context", "")
        stem = f"{index:02d}_{panelist['name']}_{affiliation.replace(' ', '_')}_{panelist['title']}_400x700mm"
        image.save(OUT / f"{stem}_150dpi.png", dpi=(150, 150))
        preview = image.resize((800, 1400), Image.Resampling.LANCZOS)
        preview.save(OUT / f"{stem}_미리보기.jpg", quality=94)
        save_pdf([image], OUT / f"{stem}_인쇄용.pdf")

    save_pdf(images[:3], OUT / "토론자_이름명패_3종_400x700mm_인쇄용_합본.pdf")
    save_pdf(images, OUT / "사회자_토론자_이름명패_4종_400x700mm_인쇄용_합본.pdf")
    make_overview(images[:3], "토론자_이름명패_3종_전체미리보기.jpg", "토론자 테이블 배너 3종")
    make_overview(images, "사회자_토론자_이름명패_4종_전체미리보기.jpg", "사회자·토론자 테이블 배너 4종")

    guide = """주민이 Green 고산 성과공유회 토론자 이름명패 제작안내

1. 품목
- 테이블 전면 부착용 세로형 미니 현수막(테이블 배너) 4종
- 사회자: 이진규(주민이 Green 고산 담당자)
- 토론자: 배영미, 전희택, 허그림

2. 최종 규격
- 완성 크기: 각 가로 400mm x 세로 700mm
- 인쇄용 PDF는 실제 크기 400 x 700mm로 제작됨
- 재단 안전영역: 사방 10mm 안쪽에 주요 글자와 로고 배치

3. 권장 소재 및 마감
- 1순위: 무광 패브릭 배너 또는 무광 합성지 200~250g
- 테이블 전면에 상단 벨크로 또는 강력 양면테이프로 고정
- 말림 방지가 필요하면 하단 10mm 봉미싱 또는 얇은 무게봉 추가
- 일반 옥외용 PVC 현수막은 광택과 말림이 커 실내 무대용으로는 비권장

4. 출력 요청
- PDF 원본 크기 100% 출력, 임의 비율 변경 금지
- 녹색과 검정 글자의 대비가 유지되도록 무광 출력
- 재단 전 이름·소속·직함 최종 확인
"""
    (OUT / "00_업체전달_제작안내.txt").write_text(guide, encoding="utf-8")
    shutil.make_archive(str(OUT), "zip", OUT.parent, OUT.name)


if __name__ == "__main__":
    main()
