# -*- coding: utf-8 -*-
"""
디자인업체 웹하드 전달용 "디자이너 요청사항" 최종 문서 생성.
- 실제 완성된 「주민이그린고산 매뉴얼(최종본).pdf」(84p) 기준 목차/쪽번호/간지 안내
- 사진 105장 전수 검토 기반 섹션별 베스트픽 배치 가이드
- 확인이 필요한 항목(마치며 삭제 여부 등) 별도 정리
흑백, 인쇄(PDF 저장) 버튼 포함.
"""
import json

with open("datauris.json", encoding="utf-8") as f:
    IMG = json.load(f)

def img(key, alt=""):
    return f'<img class="pic" src="{IMG[key]}" alt="{alt}">'

STYLE = r"""
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
  .section-title{display:flex;align-items:baseline;gap:12px;margin:56px 0 6px;}
  .section-title .num{font-family:var(--font-mono);font-size:12px;color:var(--ink-faint);font-weight:700;}
  .section-title h2{font-size:21px;font-weight:800;margin:0;}
  .section-lead{color:var(--ink-soft);margin:0 0 22px;max-width:66ch;font-size:14px;}
  hr.rule{border:none;border-top:1px solid var(--line);margin:0 0 22px;}
  .box{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:18px 22px;margin:24px 0;}
  .box h3{font-size:14.5px;margin:0 0 10px;font-weight:800;}
  .box ol,.box ul{margin:0;padding-left:20px;}
  .box li{margin-bottom:6px;font-size:13.5px;}
  .warnbox{background:#fff8f0;border:1px solid #e8c99a;border-radius:4px;padding:18px 22px;margin:24px 0;}
  .warnbox h3{font-size:14.5px;margin:0 0 10px;font-weight:800;color:#8a5a17;}
  .warnbox li{margin-bottom:8px;font-size:13.5px;}
  table{border-collapse:collapse;width:100%;font-size:12.5px;margin:16px 0;}
  th,td{border:1px solid var(--line-strong);padding:7px 10px;text-align:left;vertical-align:top;}
  th{background:var(--panel-2);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--ink-faint);}
  td.mono{font-family:var(--font-mono);}
  .entry{border:1px solid var(--line);border-radius:4px;background:var(--panel-2);padding:18px 20px;margin-bottom:14px;break-inside:avoid;}
  .entry-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
  .entry-loc .idx{font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}
  .entry-loc h3{font-size:15.5px;margin:2px 0 0;font-weight:800;}
  .entry-badges .count{font-family:var(--font-mono);font-size:11px;color:var(--ink-faint);}
  .entry-body{display:grid;grid-template-columns:150px 1fr;gap:16px;margin-top:12px;}
  .pic{width:100%;height:auto;border-radius:3px;border:1px solid var(--line-strong);display:block;}
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
  @media print{.print-bar{display:none;}body{font-size:12.5px;}.entry{break-inside:avoid;}}
  @media (max-width:640px){.cover .meta{grid-template-columns:1fr 1fr;}.entry-body{grid-template-columns:1fr;}.divlist li{grid-template-columns:1fr;}}
</style>
"""

html = STYLE
html += '<div class="print-bar"><button class="print-btn" onclick="window.print()">인쇄 / PDF로 저장</button></div>'

html += """
<div class="cover">
  <p class="eyebrow">청곡종합사회복지관 · 디자인업체 전달용 · 웹하드 업로드본</p>
  <h1>디자이너 요청사항</h1>
  <p class="sub">주민이 그린 고산 환경리빙랩 매뉴얼 — 원고 최종본(84쪽) 기준 목차·쪽번호·간지 구성과, 섹션별 실사진 베스트픽 배치 가이드를 한 문서로 정리했습니다. 사진 원본 폴더와 함께 전달합니다.</p>
  <div class="meta">
    <div><div class="k">대상 원고</div><div class="v">최종본.pdf / .hwp (84쪽)</div></div>
    <div><div class="k">간지</div><div class="v">8곳 (부표지)</div></div>
    <div><div class="k">작성일</div><div class="v">2026.7.5</div></div>
    <div><div class="k">작성</div><div class="v">이진규 (서비스제공팀)</div></div>
  </div>
</div>

<div class="sheet">

<div class="box">
  <h3>이 문서 사용법</h3>
  <ol>
    <li>먼저 <b>"확인 필요 사항"</b>을 읽어주세요 — 원고 최종본 검토 중 발견된, 디자인 착수 전에 저희 쪽에서 결정해야 할 부분입니다.</li>
    <li><b>"목차·쪽번호·간지 구성"</b>은 84쪽 전체의 페이지 배분과 부표지(간지) 8곳의 디자인 방향입니다.</li>
    <li><b>"섹션별 사진 배치 가이드"</b>는 첨부 사진 폴더 안의 실제 후보 중 베스트픽과 배치 방식입니다. 폴더명은 카드의 "폴더명" 표기와 동일합니다.</li>
    <li>얼굴이 나온 사진은 당사자(또는 보호자) 게재 동의 확인 후 사용 부탁드립니다.</li>
  </ol>
</div>

<div class="warnbox">
  <h3>⚠ 확인 필요 사항 (디자인 착수 전 결정 필요)</h3>
  <ul>
    <li><b>부록 "A-8. 마치며" 섹션이 최종본에서 통째로 빠져 있습니다.</b> 원래 구성은 A-7 제언 → A-8 마치며 → A-9 사진 → A-10 QR코드였는데, 최종본은 마치며 없이 A-7 제언 → A-8 사진 → A-9 QR로 번호가 하나씩 당겨졌습니다. 의도적 삭제인지 재확인이 필요합니다.</li>
    <li><b>목차 2쪽째(전체 3p)에 쪽번호 "- 3 -"가 노출돼 있습니다.</b> 목차 1쪽(2p)은 번호가 없는데 2쪽만 보여서 비일관합니다. 두 쪽 다 번호 비노출로 통일 필요.</li>
    <li><b>A-3 제목이 "종이팩 자원순환 운영 자료" → "종이팩 자원순환 참여 현황"으로 바뀌어 있습니다.</b> 의도한 수정인지 확인 필요.</li>
    <li>간지 8곳은 현재 "(간지)" 글자만 있는 자리표시 상태입니다 — 실제 디자인은 아래 "간지 디자인 가이드"를 참고해 제작해주세요.</li>
  </ul>
</div>

<div class="section-title"><span class="num">01</span><h2>목차·쪽번호·간지 구성</h2></div>
<p class="section-lead">최종본(84쪽) 실제 쪽수 기준입니다. 표지·목차·간지 8곳은 쪽번호를 화면에 표기하지 않되(카운트에는 포함), 발간사부터 부록 끝까지는 아라비아 숫자를 연속으로 표기합니다("- 5 -" 형식으로 최종본에 이미 반영됨).</p>

<table>
<thead><tr><th>구간</th><th>쪽수</th><th>비고</th></tr></thead>
<tbody>
<tr><td>표지</td><td class="mono">1p</td><td>번호 비노출</td></tr>
<tr><td>목차</td><td class="mono">2~3p</td><td>번호 비노출 (3p 노출 오류 수정 필요)</td></tr>
<tr><td>발간사 + 타임라인</td><td class="mono">5~8p</td><td>4p는 백면(장 시작 홀수쪽 정렬용)</td></tr>
<tr><td>프롤로그 (간지 포함)</td><td class="mono">9~11p</td><td>간지 9p</td></tr>
<tr><td>1부 (간지 포함)</td><td class="mono">12~18p</td><td>백면 12p + 간지 13p</td></tr>
<tr><td>2부 (간지 포함)</td><td class="mono">19~23p</td><td>간지 19p</td></tr>
<tr><td>3부 (간지 포함)</td><td class="mono">24~32p</td><td>백면 24p + 간지 25p</td></tr>
<tr><td>4부 (간지 포함)</td><td class="mono">33~43p</td><td>간지 33p</td></tr>
<tr><td>5부 (간지 포함)</td><td class="mono">44~55p</td><td>백면 44p + 간지 45p</td></tr>
<tr><td>에필로그 (간지 포함)</td><td class="mono">56~58p</td><td>간지 57p</td></tr>
<tr><td>부록 (간지 포함)</td><td class="mono">59~84p</td><td>간지 59p, A-0~A-9 (10개 항목)</td></tr>
</tbody>
</table>

<div class="box">
  <h3>간지(부표지) 8곳 디자인 가이드</h3>
  <ul class="divlist" style="list-style:none;margin:0;padding:0;">
    <li><b>9p</b> 프롤로그 「왜 주민이, 왜 종이팩인가」 — P-1 종이팩 사진과 톤 통일</li>
    <li><b>13p</b> 1부 「문제를 발굴하다」 — 1-1 고산동 전경 사진 톤 사용</li>
    <li><b>19p</b> 2부 「모델을 만들다」 — 2-3~2-5 회수 모델 사진 대표컷</li>
    <li><b>25p</b> 3부 「플랫폼을 만들다」 — 3-2 앱 화면 또는 3-3 매뉴얼 제작 사진</li>
    <li><b>33p</b> 4부 「이렇게 따라 하세요」 — 사진보다 흐름도·아이콘 중심 배경 권장</li>
    <li><b>45p</b> 5부 「더 완전한 시스템을 향해」 — 5-3 수성구청 협력 사진(배순향 팀장 컷)</li>
    <li><b>57p</b> 에필로그 「같은 실험을 준비하는 이들에게」 — 프롤로그 간지와 톤 통일(수미상관)</li>
    <li><b>59p</b> 부록 — 본문 5개 부와 다른 톤(무채색 계열)으로 "참고자료 섹션"임을 구분</li>
  </ul>
</div>

<div class="section-title"><span class="num">02</span><h2>섹션별 사진 배치 가이드</h2></div>
<p class="section-lead">첨부 사진 폴더 105장을 전수 검토해 섹션별 베스트픽을 선정했습니다. 프롤로그·A-6(주민환경연구원 소감)은 사진 없이 진행하기로 해 이 목록에서 제외했습니다. 타임라인 폴더는 아직 업로드된 사진이 없습니다.
</p>
"""

def entry(idx, loc, title, count, need, pick, place, folder, img_key=None, note=None):
    pic_html = f'<div>{img(img_key)}</div>' if img_key else '<div style="aspect-ratio:4/3;background:#eee;border-radius:3px;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;text-align:center;padding:8px;">사진 미확보</div>'
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
      <div class="field"><label>베스트픽 & 이유</label><div class="body-text">{pick}</div></div>
      <div class="field"><label>배치 지침</label><div class="body-text">{place}</div></div>
      <div class="field"><span class="folder-tag">{folder}</span></div>
    </div>
  </div>
  {note_html}
</div>"""

html += entry("01","발간사","관장 인사말 사진","1장",
    "청곡종합사회복지관장 — 인물 사진",
    "업로드된 4장 중 lom4i.png가 가장 정면에 가깝고 배경이 단순합니다.",
    "본문 좌측 상단 원형 소삽화(35mm), 이름·직함 캡션 동반.",
    "00_발간사", img_key="foreword")
html += entry("02","1-1","고산동은 어떤 동네인가","1장",
    "고산동 아파트 단지 전경",
    "후보가 dpysh.jpg 1장뿐입니다. 그대로 채택.",
    "1부 도입 전면 배치, 소제목은 사진 하단에 겹침.",
    "03_1부_1", img_key="1-1")
html += entry("03","1-2","주민환경연구원이 탄생하다","2장",
    "강의 듣는 장면 / 현장 조사 장면",
    "pthlm.jpg가 표정·구도가 자연스러워 우선 채택.",
    "본문 우측 세로 배치, 각 40mm.",
    "03_1부_2", img_key="1-2")
html += entry("04","1-3(고산1동)","우유백패킹","1장",
    "발대식·활동 현장 그룹샷",
    "biy0x.jpg — 2023.9 발대식 6인 조인식 장면.",
    "소제목 옆 소삽화 40mm.",
    "03_1부_3a", img_key="1-3a",
    note="부록 갤러리의 za7v0.jpg와 동일 촬영분 — 한 곳만 사용")
html += entry("05","1-3(고산2동)","쓰레갖기","1장",
    "쓰레기 줍기 활동 현장",
    "후보 te5jw.jpg 1장뿐. 그대로 채택.",
    "소제목 옆 소삽화 40mm.",
    "03_1부_3b", img_key="1-3b")
html += entry("06","1-3(고산3동)","뿌리덮은 나무","1장",
    "공원 활동 현장",
    "후보 1hpzm.jpg 1장뿐. 그대로 채택.",
    "소제목 옆 소삽화 40mm.",
    "03_1부_3c", img_key="1-3c")
html += entry("07","1-4","종이팩을 핵심 주제로","1장",
    "종이팩 세척·건조 과정",
    "kdjpk.jpg(실사진) 채택, zxzrq.png(스크린샷)는 보조자료로.",
    "1부 마지막 문단 옆 소삽화 40mm.",
    "03_1부_4", img_key="1-4")
html += entry("08","2-3","아파트 회수 모델","2장",
    "수거함 전경 / 이용 장면",
    "pbryu.jpg 최우선(고화질). mndi9·8dcnr는 저해상도라 제외.",
    "본문 하단 반면 배치.",
    "04_2부_3", img_key="2-3")
html += entry("09","2-4","카페·유관기관 회수 모델","2장",
    "카페 내부 수거함 / 안내 장면",
    "8m3ov.jpg 화질·구도 가장 우수.",
    "본문 옆 소삽화 세로 배치.",
    "04_2부_4", img_key="2-4")
html += entry("10","2-5","학교·교육기관 회수 모델","1장",
    "학교 수거함 설치 장면",
    "a0rx3.jpg 표정·구도 자연스러움.",
    "본문 옆 소삽화 40mm.",
    "04_2부_5", img_key="2-5")
html += entry("11","2-6","그린고산실천단 거버넌스","1장",
    "정기회의 장면",
    "9j9pi.jpg 고화질, 현장감 최고.",
    "본문 상단 반면.",
    "04_2부_6", img_key="2-6")
html += entry("12","2-7","노인일자리와 수거 체계","2장",
    "수거 작업 장면 / 수거물 쌓인 모습",
    "5f59g.jpg 채택. oufvs.jpg는 저해상도로 제외.",
    "본문 옆 소삽화 2장.",
    "04_2부_7", img_key="2-7",
    note="어르신 참여자 게재 동의 확인 필요")
html += entry("13","2-8","방송과 캠페인으로 확산","2장",
    "TBN 방송 출연 장면 / 캠페인 이미지",
    "xvjq4.jpg 화질·구도 우수.",
    "본문 옆 소삽화, 출처(TBN 대구교통방송) 캡션 필수.",
    "04_2부_8", img_key="2-8",
    note="방송 캡처는 TBN 측 저작권 확인 필요")
html += entry("14","3-2","주민이 그린 고산 앱","1장(+스샷)",
    "실사용 장면 + 앱 화면 스크린샷",
    "caki6.jpg 실사진 채택, 8uadn.png는 스크린샷으로 별도 프레임.",
    "실사진 소삽화, 스크린샷은 스마트폰 프레임 목업.",
    "05_3부_2", img_key="3-2")
html += entry("15","3-3","주민이 그린 고산 매뉴얼","1장",
    "매뉴얼 제작 회의 또는 검토 장면",
    "후보 parvt.jpg 1장뿐. 그대로 채택.",
    "본문 옆 소삽화 40mm.",
    "05_3부_3", img_key="3-3")
html += entry("16","5-3","수성구청 협력 경과","1장",
    "수성구청 자원순환과와의 협력 회의·세미나 장면",
    "s54s0.jpg 또는 z696g.jpg 최우선 — 명찰에 \"배순향\" 판독, 본문의 \"수성구청 자원순환과 배순향 팀장\" 서술과 정확히 일치하는 유일한 사진.",
    "본문 옆 소삽화 40mm.",
    "07_5부_3", img_key="5-3")

html += """
<div class="section-title"><span class="num">03</span><h2>부록 — 활동사진 갤러리</h2></div>
<p class="section-lead">/designer의 gallery 폴더 60장 중 눈에 띈 대표컷 4장입니다. 나머지는 웹하드 폴더 전체를 참고해 디자인업체가 자유 배치하되, 아래 주의사항을 확인해주세요.</p>
"""

html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">'
gpicks = [
    ("gallery1","0irco.jpg","발대식 MOU 전원 조인식 — 참여기관 대표 전원이 한 프레임에."),
    ("gallery2","abef9.jpg","수거함 설치 현장 — 실제 작업 중인 자연스러운 순간."),
    ("gallery3","lsjux.jpg","종이팩 정류장 설치 완료 확인 장면 — 로고·안내문 선명."),
    ("gallery4","00fw4.jpg","도서관 내 종이팩 분리배출 현장 교육 장면."),
]
for key, fn, cap in gpicks:
    html += f'<div style="background:#FAFAF9;border:1px solid #DDD;border-radius:4px;padding:8px;text-align:center;">{img(key)}<div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;margin-top:4px;">{fn}</div><div style="font-size:10.5px;color:#555;margin-top:3px;">{cap}</div></div>'
html += '</div>'

html += """
<div class="warnbox">
  <h3>갤러리 사용 시 주의사항</h3>
  <ul>
    <li>아동 얼굴이 선명한 사진 다수(6t0fm, ay27m, lgj7z, s53ul, htfno 등) — 배포 전 학부모 동의 확인 필요.</li>
    <li>20m5g.jpeg는 실내 촛불 사진으로 사업과 무관한 개인 사진으로 추정 — 갤러리에서 제외 권장.</li>
    <li>za7v0.jpg는 1-3a절 biy0x.jpg와 동일 촬영분 — 한 곳만 사용.</li>
    <li>zn03z.png, 0ybea.png 등은 사진이 아니라 행정서식 스캔본 — "활동 근거자료"로 분리 배치 권장.</li>
  </ul>
</div>

<div class="section-title"><span class="num">04</span><h2>최종 체크리스트</h2></div>
<ul class="checklist">
"""
for t in [
    "확인 필요 사항 4건(마치며 삭제, 목차 3p 번호, A-3 제목, 간지 자리표시) 청곡복지관 측 최종 확인 완료",
    "얼굴이 나온 사진 전부 당사자(또는 보호자) 게재 동의 확인 완료",
    "갤러리의 20m5g.jpeg(오업로드 추정) 제외 여부 확인",
    "1-3a biy0x.jpg / 갤러리 za7v0.jpg 중복 — 한 곳만 사용하도록 정리",
    "방송 캡처(2-8절) TBN 저작권 확인",
    "타임라인 섹션 사진 추가 확보 여부 확인",
    "웹하드에 최종본.pdf/.hwp + 사진 폴더 + 이 문서(PDF) 함께 업로드",
]:
    html += f'<li><span class="box2"></span>{t}</li>'
html += """
</ul>

</div>

<footer>
  <span>주민이 그린 고산 환경리빙랩 매뉴얼 · 디자이너 요청사항</span>
  <span>청곡종합사회복지관 서비스제공팀</span>
</footer>
"""

with open("디자이너_요청사항.html", "w", encoding="utf-8") as f:
    f.write(html)

print("완료 · 길이:", len(html))
