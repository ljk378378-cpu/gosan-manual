# -*- coding: utf-8 -*-
"""부록 활동사진 갤러리 — 중앙 큰 박스 + 주변 작은 박스 그리드 시안, A4 2페이지."""
import json

with open("datauris.json", encoding="utf-8") as f:
    IMG = json.load(f)
with open("datauris2.json", encoding="utf-8") as f:
    IMG.update(json.load(f))

def img(key):
    return f'<img src="{IMG[key]}" alt="">'

STYLE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>활동사진 갤러리 그리드 시안 — 주민이 그린 고산 매뉴얼</title>
<style>
  :root{
    --bg:#ECECE9; --ink:#151515; --ink-faint:#888; --line:#DDD;
    --font-body:"맑은 고딕","Malgun Gothic","나눔고딕",-apple-system,sans-serif;
    --font-mono:"SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);}
  .print-bar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid var(--line);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;}
  .print-bar h1{font-size:14px;margin:0;font-weight:800;}
  .print-btn{font-family:var(--font-body);font-size:13px;font-weight:700;color:#fff;background:var(--ink);border:none;border-radius:4px;padding:8px 16px;cursor:pointer;}
  .wrap{max-width:900px;margin:32px auto 80px;padding:0 16px;}
  .page{background:#fff;width:100%;aspect-ratio:210/297;margin:0 auto 40px;box-shadow:0 2px 18px rgba(0,0,0,.18);padding:14mm;display:flex;flex-direction:column;}
  .page-head{margin-bottom:10px;}
  .page-head .eyebrow{font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;color:var(--ink-faint);text-transform:uppercase;}
  .page-head h2{font-size:17px;margin:2px 0 0;font-weight:800;}
  .grid{flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:6px;grid-auto-flow:dense;}
  .grid img{width:100%;height:100%;object-fit:cover;display:block;border-radius:2px;}
  .cell{overflow:hidden;border-radius:2px;background:#eee;position:relative;}
  .cell.big{grid-column:2 / 4;grid-row:2 / 4;}
  .cell .cap{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.55));color:#fff;font-size:9px;padding:10px 6px 4px;font-family:var(--font-mono);}
  .cell.big .cap{font-size:11px;padding:16px 8px 6px;}
  .note{max-width:900px;margin:0 auto 24px;padding:16px 20px;background:#fff;border:1px solid var(--line);border-radius:4px;font-size:13px;color:#444;line-height:1.7;}
  .note b{color:#111;}
  @media print{.print-bar,.note{display:none;}body{background:#fff;}.page{box-shadow:none;margin:0;page-break-after:always;}}
</style>
</head>
<body>
<div class="print-bar"><h1>활동사진 갤러리 그리드 시안 · 주민이 그린 고산 매뉴얼</h1><button class="print-btn" onclick="window.print()">인쇄 / PDF로 저장</button></div>
<div class="wrap">

<div class="note">
  가운데 큰 박스(대표컷) 하나를 중심으로 작은 박스들이 위·아래·옆을 채우는 그리드 시안입니다. 실제 배치될 사진은 아래보다 훨씬 많으니(부록 사진만 90여 장), 이 페이지는 <b>"이런 비율·구도로 짜 달라"</b>는 형태 참고용입니다 — 실제 최종 사진 선정은 웹하드 사진 폴더 전체에서 디자이너가 자유롭게 고르면 됩니다. 사진 비율이 제각각이라 <span style="font-family:var(--font-mono)">object-fit: cover</span>로 박스에 꽉 채워 자르는 방식을 권장합니다.
</div>
"""

html = STYLE

def cell(key, cap, big=False):
    cls = "cell big" if big else "cell"
    return f'<div class="{cls}">{img(key)}<div class="cap">{cap}</div></div>'

PAGE1 = [
    ("g2", "발대식 — 전원 인증서", True),
    ("p2_3a", "아파트 회수 모델"),
    ("p1_2a", "사업설명회"),
    ("p1_3a", "고산1동 우유백패킹"),
    ("p1_3b", "고산2동 쓰레갖기"),
    ("p1_3c", "고산3동 뿌리덮은 나무"),
    ("p1_4a", "종이팩 제출"),
    ("p2_2a", "팩누리 팀"),
    ("p2_2b", "에코그린 팀"),
    ("p2_2c", "요기모다 팀"),
    ("p2_4", "카페 회수 모델"),
    ("p2_5", "학교 회수 모델"),
    ("p2_6", "그린고산실천단 위촉식"),
]

PAGE2 = [
    ("g3", "환경교육아카데미", True),
    ("g4", "팝업환경도서관"),
    ("p2_7", "종이팩 수거단 출범식"),
    ("p2_8", "MBC 라디오 출연"),
    ("p3_2a", "앱 메인 화면"),
    ("p3_2b", "앱 지도 화면"),
    ("p3_3a", "매뉴얼 제작 회의"),
    ("p3_3b", "앱 검증 활동"),
    ("p5_3a", "수성구청 협력 세미나"),
    ("p5_3b", "수성구청 협력 세미나 2"),
    ("p5_4a", "최근 협력 회의"),
    ("cover1", "시니어클럽 협약"),
    ("cover3", "에너지마을 견학"),
]

def render_page(items, no, title):
    cells = ""
    for it in items:
        key, cap = it[0], it[1]
        big = it[2] if len(it) > 2 else False
        cells += cell(key, cap, big)
    return f"""
<div class="page">
  <div class="page-head"><div class="eyebrow">부록 · 활동사진 갤러리 · {no}p</div><h2>{title}</h2></div>
  <div class="grid">{cells}</div>
</div>
"""

html += render_page(PAGE1, "01", "3년의 현장 — 발굴부터 모델까지")
html += render_page(PAGE2, "02", "확산과 협력의 기록")

html += """
</div>
</body>
</html>
"""

with open("활동사진갤러리_그리드시안.html", "w", encoding="utf-8") as f:
    f.write(html)
print("완료 · 길이:", len(html))
