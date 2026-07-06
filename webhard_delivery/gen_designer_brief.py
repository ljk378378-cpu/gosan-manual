# -*- coding: utf-8 -*-
"""
디자인업체 웹하드 전달용 "디자이너 요청사항 — 사진 배치 가이드" 문서 생성.
- "메뉴얼 사진"/"메뉴얼 사진2" 폴더 실사진 기준 섹션별 후보(2~3장) 배치 가이드
흑백, 인쇄(PDF 저장) 버튼 포함.
"""
import json

with open("datauris.json", encoding="utf-8") as f:
    IMG = json.load(f)
with open("datauris2.json", encoding="utf-8") as f:
    IMG.update(json.load(f))

def img(key, alt=""):
    return f'<img class="pic" src="{IMG[key]}" alt="{alt}">'

STYLE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>디자이너 요청사항 — 주민이 그린 고산 환경리빙랩 매뉴얼</title>
<style>
  :root{
    --bg:#fff; --panel:#F4F4F2; --panel-2:#FAFAF9;
    --ink:#151515; --ink-soft:#555; --ink-faint:#888;
    --line:#DDD; --line-strong:#BBB;
    --font-body:"맑은 고딕","Malgun Gothic","나눔고딕",-apple-system,sans-serif;
    --font-mono:"SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);line-height:1.75;font-size:15px;-webkit-font-smoothing:antialiased;}
  .sheet{max-width:880px;margin:0 auto;padding:0 24px 120px;}
  .cover{padding:60px 24px 40px;max-width:880px;margin:0 auto;border-bottom:2px solid var(--ink);}
  .cover .eyebrow{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;color:var(--ink-faint);text-transform:uppercase;margin:0 0 16px;}
  .cover h1{font-size:32px;font-weight:800;line-height:1.35;margin:0 0 12px;}
  .cover .sub{font-size:15.5px;color:var(--ink-soft);margin:0 0 28px;max-width:60ch;}
  .cover .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--line);padding-top:16px;}
  .cover .meta .k{font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;color:var(--ink-faint);text-transform:uppercase;margin-bottom:5px;}
  .cover .meta .v{font-size:13px;font-weight:700;}
  .section-title{display:flex;align-items:baseline;gap:12px;margin:56px 0 6px;break-after:avoid;page-break-after:avoid;}
  .section-title .num{font-family:var(--font-mono);font-size:12px;color:var(--ink-faint);font-weight:700;}
  .section-title h2{font-size:21px;font-weight:800;margin:0;}
  .section-lead{color:var(--ink-soft);margin:0 0 22px;max-width:66ch;font-size:14px;}
  hr.rule{border:none;border-top:1px solid var(--line);margin:0 0 22px;}
  .box{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:18px 22px;margin:24px 0;break-inside:avoid;page-break-inside:avoid;}
  .box h3{font-size:14.5px;margin:0 0 10px;font-weight:800;}
  .box ol,.box ul{margin:0;padding-left:20px;}
  .box li{margin-bottom:6px;font-size:13.5px;}
  .warnbox{background:#fff8f0;border:1px solid #e8c99a;border-radius:4px;padding:18px 22px;margin:24px 0;break-inside:avoid;page-break-inside:avoid;}
  .warnbox h3{font-size:14.5px;margin:0 0 10px;font-weight:800;color:#8a5a17;}
  .warnbox li{margin-bottom:8px;font-size:13.5px;}
  table{border-collapse:collapse;width:100%;font-size:12.5px;margin:16px 0;}
  th,td{border:1px solid var(--line-strong);padding:7px 10px;text-align:left;vertical-align:top;}
  tr{break-inside:avoid;page-break-inside:avoid;}
  th{background:var(--panel-2);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--ink-faint);}
  td.mono{font-family:var(--font-mono);}
  .entry{border:1px solid var(--line);border-radius:4px;background:var(--panel-2);padding:18px 20px;margin-bottom:14px;break-inside:avoid;page-break-inside:avoid;}
  .entry-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
  .entry-loc .idx{font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}
  .entry-loc h3{font-size:15.5px;margin:2px 0 0;font-weight:800;}
  .entry-badges .count{font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}
  .entry-body{display:grid;grid-template-columns:300px 1fr;gap:16px;margin-top:12px;}
  .pic{width:100%;height:140px;object-fit:cover;border-radius:3px;border:1px solid var(--line-strong);display:block;}
  .field{margin-bottom:10px;}
  .field:last-child{margin-bottom:0;}
  .field label{display:block;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:4px;}
  .field .body-text{font-size:13.5px;}
  .folder-tag{font-family:var(--font-mono);font-size:11.5px;background:var(--panel);border:1px solid var(--line-strong);border-radius:3px;padding:2px 7px;}
  .note{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line-strong);font-size:12px;color:#8a5a17;}
  .divlist{list-style:none;margin:0;padding:0;}
  .divlist li{display:grid;grid-template-columns:110px 1fr;gap:14px;padding:12px 0;border-bottom:1px solid var(--line);font-size:13.5px;}
  .divlist li:last-child{border-bottom:none;}
  .divlist b{font-family:var(--font-mono);}
  .checklist{list-style:none;margin:0;padding:0;}
  .checklist li{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);font-size:13.5px;}
  .checklist li:last-child{border-bottom:none;}
  .checklist .box2{width:14px;height:14px;border:1.5px solid var(--line-strong);border-radius:3px;flex-shrink:0;margin-top:3px;}
  footer{max-width:880px;margin:56px auto 0;padding:20px 24px;border-top:1px solid var(--line);color:var(--ink-faint);font-size:12px;display:flex;justify-content:space-between;}
  .print-bar{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 24px;display:flex;justify-content:flex-end;}
  .print-btn{font-family:var(--font-body);font-size:13px;font-weight:700;color:#fff;background:var(--ink);border:none;border-radius:4px;padding:8px 16px;cursor:pointer;}
  @page{size:A4;margin:14mm 12mm;}
  @media print{
    .print-bar{display:none;}
    body{font-size:12.5px;background:#fff;}
    .cover{break-after:page;page-break-after:always;}
    .entry,.box,.warnbox{break-inside:avoid;page-break-inside:avoid;}
    .section-title{break-inside:avoid;page-break-inside:avoid;}
  }
  @media (max-width:640px){.cover .meta{grid-template-columns:1fr 1fr;}.entry-body{grid-template-columns:1fr;}.divlist li{grid-template-columns:1fr;}}
</style>
</head>
<body>
"""

html = STYLE
html += '<div class="print-bar"><button class="print-btn" onclick="window.print()">인쇄 / PDF로 저장</button></div>'

html += """
<div class="cover">
  <p class="eyebrow">청곡종합사회복지관 · 디자인업체 전달용 · 웹하드 업로드본</p>
  <h1>디자이너 요청사항 — 사진 배치 가이드</h1>
  <p class="sub">주민이 그린 고산 환경리빙랩 매뉴얼 — 섹션별 실사진 후보와 배치 지침입니다. 사진 원본 폴더(메뉴얼 사진 / 메뉴얼 사진2)와 함께 전달합니다.</p>
  <div class="meta">
    <div><div class="k">대상 원고</div><div class="v">최종본.pdf / .hwp</div></div>
    <div><div class="k">작성일</div><div class="v">2026.7.5</div></div>
    <div><div class="k">작성</div><div class="v">이진규 (서비스제공팀)</div></div>
  </div>
</div>

<div class="sheet">
"""

html += """
<div class="section-title"><span class="num">01</span><h2>섹션별 사진 배치 가이드</h2></div>
<p class="section-lead">청곡복지관이 <b>"메뉴얼 사진" / "메뉴얼 사진2"</b> 폴더에 직접 재분류·업로드한 실사진 기준입니다. 대부분 섹션을 최종 후보 2~3장으로 좁혀두었으니 디자이너와 상의해 그중 하나로 확정해 주세요. 프롤로그·A-6(주민환경연구원 소감)·타임라인은 사진 없이 진행합니다.</p>
"""

def entry(idx, loc, title, count, need, pick, place, folder, img_keys=None, note=None):
    if img_keys:
        cells = "".join(
            f'<div style="text-align:center;">{img(k)}<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);margin-top:3px;">{lbl}</div></div>'
            for k, lbl in img_keys
        )
        cols = min(len(img_keys), 3)
        pic_html = f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:8px;">{cells}</div>'
    else:
        pic_html = '<div style="aspect-ratio:4/3;background:#eee;border-radius:3px;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;text-align:center;padding:8px;">사진 미확보</div>'
    note_html = f'<div class="note">⚠ {note}</div>' if note else ""
    return f"""
<div class="entry">
  <div class="entry-head">
    <div class="entry-loc"><span class="idx">{idx} · {loc}</span><h3>{title}</h3></div>
    <div class="entry-badges"><span class="count">{count}</span></div>
  </div>
  <div class="entry-body">
    {pic_html}
    <div>
      <div class="field"><label>필요 사진</label><div class="body-text">{need}</div></div>
      <div class="field"><label>후보 & 추천</label><div class="body-text">{pick}</div></div>
      <div class="field"><label>배치 지침</label><div class="body-text">{place}</div></div>
      <div class="field"><span class="folder-tag">{folder}</span></div>
    </div>
  </div>
  {note_html}
</div>"""

html += entry("00","표지","표지 대표컷","3장 중 1장 최종확정 (강력추천 ①②)",
    "매뉴얼 전체를 상징하는 대표컷 (표지 폴더는 비어 있어 다른 폴더에서 선정)",
    "① 페이스북 6.jpg — 「주민이 Green 고산」발대식 및 위촉식 전체 배너와 일시·장소·주관까지 선명하게 보이는 18인 단체샷. 정보성·구도·해상도 모두 최상, 최우선 추천. ② 페이스북 4.jpg — 같은 발대식에서 10인이 테이블에 앉아 협약서를 들고 있는 공식 조인식 컷, ①과 세트로 쓰기 좋음. ③ 표지사진 후보.jpeg — 에너지마을 선진지견학 옥상 태양광 패널 위 단체샷, 구도가 역동적이고 인상적. 다만 \"주민이Green고산\" 브랜드 요소가 화면에 없어 ①②보다는 보조 후보.",
    "표지 전면 배경 또는 상단 1/2 배치. 제목·부제는 사진 위 반투명 박스로 얹는 방식 권장.",
    "메뉴얼 사진 잘나온사진 폴더 (①②), 프로젝트 루트 (③)", img_keys=[("cover4","① 페이스북6 (발대식 전체)"),("cover5","② 페이스북4 (조인식)"),("cover3","③ 에너지마을 견학")])
html += entry("01","발간사","관장 인사말 사진","2장 중 1장 권장",
    "청곡종합사회복지관장 — 인물 사진",
    "① 관장님 사진.png — 정면 프로필컷으로 소삽화용으로 가장 무난, 우선 권장. ② KakaoTalk 스냅컷 — 자연스러운 표정의 보조 후보.",
    "본문 좌측 상단 원형 소삽화(35mm), 이름·직함 캡션 동반.",
    "메뉴얼 사진/00. 발간사/", img_keys=[("fw1","① 관장님 사진"),("fw2","② 스냅컷")])
html += entry("02","1-2","주민환경연구원이 탄생하다","2장 중 1장 권장",
    "사업설명회 현장",
    "① 1차년도 사업설명회(1) — 강사 발표 장면, 전체 분위기가 잘 보여 대표컷으로 권장. ② 사업설명회(2) — 참석 주민 반응 컷, 보조용.",
    "본문 우측 반면 배치.",
    "메뉴얼 사진/1. 1부 문제를 발굴하다/", img_keys=[("p1_2a","① 사업설명회(1)"),("p1_2b","② 사업설명회(2)")])
html += entry("03","1-3(고산1동)","우유백패킹","1장",
    "고산1동 활동 현장",
    "후보가 1장뿐입니다. 그대로 채택.",
    "소제목 옆 소삽화 40mm.",
    "메뉴얼 사진/1. 1부 문제를 발굴하다/", img_keys=[("p1_3a","고산1동 우유백패킹")])
html += entry("04","1-3(고산2동)","쓰레갖기","1장",
    "고산2동 활동 현장",
    "후보가 1장뿐입니다. 그대로 채택.",
    "소제목 옆 소삽화 40mm.",
    "메뉴얼 사진/1. 1부 문제를 발굴하다/", img_keys=[("p1_3b","고산2동 쓰레갖기")])
html += entry("05","1-3(고산3동)","뿌리덮은 나무","1장",
    "고산3동 활동 현장",
    "후보가 1장뿐입니다. 그대로 채택.",
    "소제목 옆 소삽화 40mm.",
    "메뉴얼 사진/1. 1부 문제를 발굴하다/", img_keys=[("p1_3c","고산3동 뿌리덮은 나무")])
html += entry("06","1-4","종이팩을 핵심 주제로","2장 중 1장 권장",
    "종이팩 제출·인증 장면",
    "① 종이팩 제출 실사진 — 현장감이 살아 있어 우선 권장. ② 제출 인증샷 — 보조 후보.",
    "1부 마지막 문단 옆 소삽화 40mm.",
    "메뉴얼 사진/1. 1부 문제를 발굴하다/", img_keys=[("p1_4a","① 종이팩 제출"),("p1_4b","② 제출 인증")])
html += entry("07","2-2","세 팀으로 나누어 역할을 정하다","4장",
    "팩누리 / 에코그린 / 요기모다 3개 팀 활동 장면 + 회수모델 전체 개요",
    "팀별 사진 3장은 어느 한 팀도 누락되지 않도록 병렬 배치 권장. ＋ \"5-1. 회수모델별 종이팩 수거함\"(개요컷)은 아파트·카페·학교 3개 모델을 한 프레임에 담은 사진이라 특정 모델(아파트) 절에 넣기보다 이 절의 도입부 또는 2부 간지(부표지) 배경으로 쓰는 편이 내용과 더 맞습니다.",
    "팀 3장은 본문에 3단 나란히 + 팀명 캡션. 개요컷은 2-2 도입부 상단 또는 2부 간지 배경으로.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_2a","팩누리 팀"),("p2_2b","에코그린 팀"),("p2_2c","요기모다 팀"),("p2_3b","회수모델 3종 개요")])
html += entry("08","2-3","아파트 회수 모델","1장",
    "수거함 전경 / 이용 장면",
    "해당 절 전용컷 1장. 그대로 채택.",
    "본문 하단 반면 배치.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_3a","아파트 회수 모델")])
html += entry("09","2-4","카페·유관기관 회수 모델","1장",
    "카페 내부 수거함 / 안내 장면",
    "해당 절 전용컷 1장. 그대로 채택.",
    "본문 옆 소삽화.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_4","카페 회수 모델")])
html += entry("10","2-5","학교·교육기관 회수 모델","1장",
    "학교 수거함 설치 장면",
    "해당 절 전용컷 1장. 그대로 채택.",
    "본문 옆 소삽화 40mm.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_5","학교·교육기관 회수 모델")])
html += entry("11","2-6","그린고산실천단 거버넌스","1장",
    "위촉식 장면",
    "Green고산실천단 위촉식 컷. 그대로 채택.",
    "본문 상단 반면.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_6","위촉식")])
html += entry("12","2-7","노인일자리와 수거 체계","2장",
    "수거단 출범식 + 시니어클럽 협약 장면",
    "① 종이팩 수거단 출범식 — 실제 일자리 참여 어르신들이 나오는 현장컷. ② 대구수성시니어클럽 협약식(IMG_0284) — 노인일자리 연계 기관과의 협약 장면으로, 표지 후보에서 내려 이 절 본문으로 재배치.",
    "본문 옆 소삽화 2장, 나란히 배치.",
    "메뉴얼 사진/2. 2부 모델을 만들다/, 메뉴얼 사진2/", img_keys=[("p2_7","① 수거단 출범식"),("cover1","② 시니어클럽 협약")],
    note="참여자 얼굴 노출 시 게재 동의 확인 필요")
html += entry("13","2-8","방송과 캠페인으로 확산","1장",
    "MBC 라디오 출연 장면",
    "MBC 즐거운 오후 2시 출연 컷. 그대로 채택.",
    "본문 옆 소삽화, 출처(MBC) 캡션 필수.",
    "메뉴얼 사진/2. 2부 모델을 만들다/", img_keys=[("p2_8","MBC 라디오 출연")],
    note="방송 캡처는 MBC 측 저작권 확인 필요")
html += entry("14","3-2","주민이 그린 고산 앱","2장 (스크린샷)",
    "앱 화면 스크린샷",
    "① 앱 메인 화면 ② 수거함 위치 지도 화면 — 둘 다 스마트폰 프레임 목업으로 나란히 배치 권장.",
    "스마트폰 프레임 목업 2개 나란히.",
    "메뉴얼 사진/3. 3부 플랫폼을 만들다/", img_keys=[("p3_2a","① 메인 화면"),("p3_2b","② 지도 화면")])
html += entry("15","3-3","주민이 그린 고산 매뉴얼","2장 중 1장 권장",
    "매뉴얼 제작 회의 또는 검증 활동 장면",
    "① 매뉴얼 제작 회의중인 팩도리팩수니 팀 — 집필 과정이 드러나 우선 권장. ② 앱 검증 활동 — 보조 후보.",
    "본문 옆 소삽화 40mm.",
    "메뉴얼 사진/3. 3부 플랫폼을 만들다/", img_keys=[("p3_3a","① 매뉴얼 제작 회의"),("p3_3b","② 앱 검증 활동")])
html += entry("16","5-3","고산동과 수성구청의 협력 경과","2장 중 1장 권장",
    "수성구청 자원순환과와의 협력 회의·세미나 장면",
    "2025.6.25 세미나 컷 2장 — 명찰에 \"배순향\" 판독 가능, 본문의 \"수성구청 자원순환과 배순향 팀장\" 서술과 정확히 일치. 구도가 더 정면인 ①을 권장.",
    "본문 옆 소삽화 40mm.",
    "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/", img_keys=[("p5_3a","① 세미나 정면"),("p5_3b","② 세미나 측면")])
html += entry("17","5-4","협력이 깊어지면 나타나는 변화","1장",
    "최근 협력 진행 상황을 보여주는 회의 장면",
    "2026.7.4 최근 내부 회의 컷 — \"협력은 진행 중이다\"라는 본문 서술을 뒷받침하는 가장 최신 사진. 같은 장면 연속컷이 여러 장 있어 가장 자연스러운 1장만 채택(중복 방지).",
    "본문 옆 소삽화 40mm.",
    "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/", img_keys=[("p5_4a","최근 회의")])

html += """
<div class="section-title"><span class="num">02</span><h2>부록 — 활동사진 갤러리</h2></div>
<p class="section-lead">"메뉴얼 사진/7. 부록" 폴더(약 90장) 중 대표성이 가장 뚜렷한 4장입니다. 나머지는 웹하드 폴더 전체를 참고해 디자인업체가 자유 배치하되, 아래 주의사항을 확인해주세요.</p>
"""

html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">'
gpicks = [
    ("g1","발대식 (1).jpg","발대식 MOU 조인식 — 현수막·지구본 소품과 참석자 전원이 한 프레임에."),
    ("g2","발대식 (4).jpg","발대식 대규모 단체샷 — 20여 명이 인증서를 들고 있는 구도."),
    ("g3","제1회 환경교육아카데미.jpg","환경교육아카데미 현장 — 병행활동 소개용 대표컷."),
    ("g4","1차 팝업환경도서관.JPG","팝업환경도서관 현장 — 병행활동(5-1절) 소개용 대표컷."),
]
for key, fn, cap in gpicks:
    html += f'<div style="background:#FAFAF9;border:1px solid #DDD;border-radius:4px;padding:8px;text-align:center;">{img(key)}<div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;margin-top:4px;">{fn}</div><div style="font-size:10.5px;color:#555;margin-top:3px;">{cap}</div></div>'
html += '</div>'

html += """
<div class="warnbox">
  <h3>갤러리 사용 시 주의사항</h3>
  <ul>
    <li>아동 얼굴이 선명한 사진(환경교육아카데미, 팝업도서관 등) — 배포 전 학부모 동의 확인 필요.</li>
    <li>부록 폴더의 A-4-1~A-4-9 하위 폴더는 사진이 아니라 실행 양식(신청서·설문지·일지 등) 스캔본입니다 — A-4절 "활동 근거자료"로 이미 반영되어 있으니 갤러리와 혼동하지 않도록 분리 배치.</li>
    <li>표지 후보(IMG_0284, IMG_4769)와 갤러리 발대식 사진(g1·g2)은 같은 행사(발대식) 촬영분입니다 — 표지에 쓰인 컷은 갤러리에서 중복 배치하지 않도록 정리.</li>
  </ul>
</div>

<div class="section-title"><span class="num">03</span><h2>체크리스트</h2></div>
<ul class="checklist">
"""
for t in [
    "표지 후보 2장(페이스북6 발대식 전체 / 페이스북4 조인식) 중 디자이너와 상의해 최종 1장 확정",
    "얼굴이 나온 사진 전부 당사자(또는 보호자) 게재 동의 확인",
    "표지·갤러리 발대식 사진 중복 사용 여부 정리",
    "방송 캡처(2-8절) MBC 저작권 확인",
    "웹하드에 최종본.pdf/.hwp + 사진 폴더(메뉴얼 사진/메뉴얼 사진2) + 이 문서(PDF) 함께 업로드",
]:
    html += f'<li><span class="box2"></span>{t}</li>'
html += """
</ul>

</div>

<footer>
  <span>주민이 그린 고산 환경리빙랩 매뉴얼 · 디자이너 요청사항</span>
  <span>청곡종합사회복지관 서비스제공팀</span>
</footer>
</body>
</html>
"""

with open("디자이너_요청사항.html", "w", encoding="utf-8") as f:
    f.write(html)

print("완료 · 길이:", len(html))
