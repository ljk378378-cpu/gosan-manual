# -*- coding: utf-8 -*-
"""
합본작업본.md를 실제 간지·쪽번호가 반영된 '페이지 미리보기' HTML로 변환.
각 절을 목차.md의 쪽수 배분에 맞춰 A4 비율 페이지 블록으로 나눠서
브라우저에서 인쇄물처럼 스크롤하며 볼 수 있게 만든다.

주의: 절 내부에서 몇 쪽째에 어디서 끊기는지는 실제 디자인 폰트/사진 크기에
따라 달라지므로, 여기서는 문단 단위로 균등 배분한 추정치다.
"""
import re
import markdown

SRC = "주민이그린고산_전체원고_합본작업본.md"
OUT = "원고_페이지미리보기.html"

with open(SRC, encoding="utf-8") as f:
    text = f.read()

blocks = text.split("\n\n")


def find_idx(anchor):
    for i, b in enumerate(blocks):
        if b.strip() == anchor or b.strip().startswith(anchor + "\n"):
            return i
    raise ValueError(f"anchor not found: {anchor!r}")


def slice_blocks(start_anchor, end_anchor):
    """start_anchor 다음 블록부터 end_anchor 직전까지, 간지 지시문 블록은 제외."""
    si = find_idx(start_anchor) + 1
    ei = find_idx(end_anchor)
    chunk = blocks[si:ei]
    return [b for b in chunk if not b.strip().startswith("▶ [간지")]


def to_html(md_blocks):
    md_text = "\n\n".join(md_blocks)
    return markdown.markdown(md_text, extensions=["tables", "nl2br"])


def split_evenly(md_blocks, n):
    """문단 블록을 글자 수 기준으로 n등분(최선의 추정)."""
    if n <= 1 or not md_blocks:
        return [md_blocks]
    total = sum(len(b) for b in md_blocks) or 1
    target = total / n
    result = []
    cur = []
    cur_len = 0
    for b in md_blocks:
        cur.append(b)
        cur_len += len(b)
        if cur_len >= target and len(result) < n - 1:
            result.append(cur)
            cur = []
            cur_len = 0
    result.append(cur)
    while len(result) < n:
        result.append([])
    return result


# (item_id, footer_title, start_page, num_pages, kind, start_anchor, end_anchor)
# kind: content / placeholder / divider / cover / toc / backcover
ITEMS = [
    ("cover", None, 1, 1, "cover", None, None),
    ("toc", None, 2, 2, "toc", None, None),
    ("foreword", "발간사", 4, 1, "content",
     "## 관장 발간사 - 1p", "# 이 매뉴얼을 읽기 전에 - 3년의 여정 타임라인"),
    ("timeline", "이 매뉴얼을 읽기 전에 — 3년의 여정 타임라인", 5, 2, "placeholder", None, None),
    ("div-prologue", None, 7, 1, "divider", None, None),
    ("p1", "프롤로그 · P-1. 왜 종이팩인가", 8, 1, "content",
     "## P-1. 왜 종이팩인가", "## P-2. 왜 주민인가"),
    ("p2", "프롤로그 · P-2. 왜 주민인가", 9, 2, "content",
     "## P-2. 왜 주민인가", "# 1부. 문제를 발굴하다"),
    ("div-1", None, 11, 1, "divider", None, None),
    ("1-1", "1부 · 1-1. 고산동은 어떤 동네인가", 12, 1, "content",
     "## 1-1. 고산동은 어떤 동네인가", "## 1-2. 주민환경연구원이 탄생하다"),
    ("1-2", "1부 · 1-2. 주민환경연구원이 탄생하다", 13, 2, "content",
     "## 1-2. 주민환경연구원이 탄생하다", "## 1-3. 동별로 발굴한 세 가지 환경 문제"),
    ("1-3", "1부 · 1-3. 동별로 발굴한 세 가지 환경 문제", 15, 2, "content",
     "## 1-3. 동별로 발굴한 세 가지 환경 문제", "## 1-4. 종이팩 자원순환을 핵심 주제로 선택하다"),
    ("1-4", "1부 · 1-4. 종이팩 자원순환을 핵심 주제로 선택하다", 17, 1, "content",
     "## 1-4. 종이팩 자원순환을 핵심 주제로 선택하다", "# 2부. 모델을 만들다"),
    ("div-2", None, 18, 1, "divider", None, None),
    ("2-1", "2부 · 2-1. 1차년도에서 2차년도로", 19, 1, "content",
     "## 2-1. 1차년도에서 2차년도로", "## 2-2. 세 팀으로 나누어 역할을 정하다"),
    ("2-2", "2부 · 2-2. 세 팀으로 나누어 역할을 정하다", 20, 1, "content",
     "## 2-2. 세 팀으로 나누어 역할을 정하다", "## 2-3. 아파트 회수 모델"),
    ("2-3", "2부 · 2-3. 아파트 회수 모델", 21, 1, "content",
     "## 2-3. 아파트 회수 모델", "## 2-4. 카페·유관기관 회수 모델"),
    ("2-4", "2부 · 2-4. 카페·유관기관 회수 모델", 22, 1, "content",
     "## 2-4. 카페·유관기관 회수 모델", "## 2-5. 학교·교육기관 회수 모델"),
    ("2-5", "2부 · 2-5. 학교·교육기관 회수 모델", 23, 1, "content",
     "## 2-5. 학교·교육기관 회수 모델", "## 2-6. 그린고산실천단 거버넌스"),
    ("2-6", "2부 · 2-6. 그린고산실천단 거버넌스", 24, 1, "content",
     "## 2-6. 그린고산실천단 거버넌스", "## 2-7. 노인일자리와 수거 체계"),
    ("2-7", "2부 · 2-7. 노인일자리와 수거 체계", 25, 1, "content",
     "## 2-7. 노인일자리와 수거 체계", "## 2-8. 방송과 캠페인으로 확산하다"),
    ("2-8", "2부 · 2-8. 방송과 캠페인으로 확산하다", 26, 1, "content",
     "## 2-8. 방송과 캠페인으로 확산하다", "# 3부. 플랫폼을 만들다"),
    ("div-3", None, 27, 1, "divider", None, None),
    ("3-1", "3부 · 3-1. 모델은 완성됐다, 다음을 준비하다", 28, 2, "content",
     "## 3-1. 모델은 완성됐다, 다음을 준비하다", "## 3-2. 주민이 그린 고산 앱"),
    ("3-2", "3부 · 3-2. 주민이 그린 고산 앱", 30, 2, "content",
     "## 3-2. 주민이 그린 고산 앱", "## 3-3. 주민이 그린 고산 매뉴얼"),
    ("3-3", "3부 · 3-3. 주민이 그린 고산 매뉴얼", 32, 2, "content",
     "## 3-3. 주민이 그린 고산 매뉴얼", "## 3-4. 플랫폼이 완성된다는 것"),
    ("3-4", "3부 · 3-4. 플랫폼이 완성된다는 것", 34, 1, "content",
     "## 3-4. 플랫폼이 완성된다는 것", "# 4부. 이렇게 따라 하세요"),
    ("div-4", None, 35, 1, "divider", None, None),
    ("4-0", "4부 · 4-0. 시작하기 전에", 36, 3, "content",
     "## 4-0. 시작하기 전에", "## 4-1. 1단계: 주민환경연구원 모집"),
    ("4-1", "4부 · 4-1. 1단계: 주민환경연구원 모집", 39, 2, "content",
     "## 4-1. 1단계: 주민환경연구원 모집", "## 4-2. 2단계: 수거 거점 구축"),
    ("4-2", "4부 · 4-2. 2단계: 수거 거점 구축", 41, 2, "content",
     "## 4-2. 2단계: 수거 거점 구축", "## 4-3. 3단계: 세척·집하·납품"),
    ("4-3", "4부 · 4-3. 3단계: 세척·집하·납품", 43, 2, "content",
     "## 4-3. 3단계: 세척·집하·납품", "## 4-4. 4단계: 거버넌스 구축"),
    ("4-4", "4부 · 4-4. 4단계: 거버넌스 구축", 45, 2, "content",
     "## 4-4. 4단계: 거버넌스 구축", "## 4-5. 현장에서 자주 막히는 문제들"),
    ("4-5", "4부 · 4-5. 현장에서 자주 막히는 문제들", 47, 2, "content",
     "## 4-5. 현장에서 자주 막히는 문제들", "# 5부. 더 완전한 시스템을 향해"),
    ("div-5", None, 49, 1, "divider", None, None),
    ("5-1", "5부 · 5-1. 3년의 성과와 남은 과제", 50, 2, "content",
     "## 5-1. 3년의 성과와 남은 과제", "## 5-2. 유사사례와 정책 흐름"),
    ("5-2", "5부 · 5-2. 유사사례와 정책 흐름", 52, 2, "content",
     "## 5-2. 유사사례와 정책 흐름", "## 5-3. 고산동과 수성구청의 협력 경과"),
    ("5-3", "5부 · 5-3. 고산동과 수성구청의 협력 경과", 54, 2, "content",
     "## 5-3. 고산동과 수성구청의 협력 경과", "## 5-4. 협력이 깊어지면 나타나는 변화"),
    ("5-4", "5부 · 5-4. 협력이 깊어지면 나타나는 변화", 56, 1, "content",
     "## 5-4. 협력이 깊어지면 나타나는 변화", "## 5-5. 결론"),
    ("5-5", "5부 · 5-5. 결론", 57, 1, "content",
     "## 5-5. 결론", "# 에필로그. 같은 실험을 준비하는 이들에게"),
    ("div-epilogue", None, 58, 1, "divider", None, None),
    ("epilogue", "에필로그. 같은 실험을 준비하는 이들에게", 59, 1, "content",
     "# 에필로그. 같은 실험을 준비하는 이들에게", "# 부록"),
    ("div-appendix", None, 60, 1, "divider", None, None),
    ("a0", "부록 · A-0. 용어 설명", 61, 1, "content",
     "## A-0. 용어 설명", "## A-1. 3개년 주요 참여 현황"),
    ("a1", "부록 · A-1. 3개년 주요 참여 현황", 62, 1, "content",
     "## A-1. 3개년 주요 참여 현황", "## A-2. 연도별 컨소시엄 및 협력기관 목록"),
    ("a2", "부록 · A-2. 연도별 컨소시엄 및 협력기관 목록", 63, 2, "content",
     "## A-2. 연도별 컨소시엄 및 협력기관 목록", "## A-3. 종이팩 자원순환 운영 자료"),
    ("a3", "부록 · A-3. 종이팩 자원순환 운영 자료", 65, 2, "content",
     "## A-3. 종이팩 자원순환 운영 자료", "## A-4. 실행 양식"),
    ("a4", "부록 · A-4. 실행 양식", 67, 3, "content",
     "## A-4. 실행 양식", "## A-5. 주민환경연구원 명단"),
    ("a5", "부록 · A-5. 주민환경연구원 명단", 70, 1, "content",
     "## A-5. 주민환경연구원 명단", "## A-6. 주민환경연구원 소감"),
    ("a6", "부록 · A-6. 주민환경연구원 소감", 71, 3, "content",
     "## A-6. 주민환경연구원 소감", "## A-7. 제언 — 3년간 진행된 환경리빙랩 활동에 관해"),
    ("a7", "부록 · A-7. 제언", 74, 1, "content",
     "## A-7. 제언 — 3년간 진행된 환경리빙랩 활동에 관해", "## A-8. 사진으로 추억하는 주민이 그린 고산 3년"),
    ("a8", "부록 · A-8. 사진으로 추억하는 주민이 그린 고산 3년", 75, 3, "placeholder", None, None),
    ("a9", "부록 · A-9. 앱 QR코드 및 문의처", 78, 1, "placeholder", None, None),
    ("blank", None, 79, 1, "blank", None, None),
    ("backcover", None, 80, 1, "backcover", None, None),
]

DIVIDER_INFO = {
    "div-prologue": ("프롤로그", "왜 주민이, 왜 종이팩인가"),
    "div-1": ("1부", "문제를 발굴하다"),
    "div-2": ("2부", "모델을 만들다"),
    "div-3": ("3부", "플랫폼을 만들다"),
    "div-4": ("4부", "이렇게 따라 하세요"),
    "div-5": ("5부", "더 완전한 시스템을 향해"),
    "div-epilogue": ("에필로그", "같은 실험을 준비하는 이들에게"),
    "div-appendix": ("부록", ""),
}

PLACEHOLDER_TEXT = {
    "timeline": "인포그래픽 삽입 예정<br>주민이 그린 고산 환경리빙랩 3년의 여정<br><span class='ph-note'>(연도별 3단 구성 · NotebookLM 참고 시안 별도 전달 · 기획사가 책자 톤으로 재구성)</span>",
    "a8": "사진 삽입 예정<br>3년간 활동 사진 모음<br><span class='ph-note'>(디자인가이드 photo-brief.html 섹션별 베스트픽 참고)</span>",
    "a9": "QR코드 삽입 예정<br>주민이 그린 고산 앱 · 웹진 · 인스타그램<br><span class='ph-note'>문의: 청곡종합사회복지관</span>",
}

TOC_HTML = """
<p class="item"><span class="num">4</span><span class="t">발간사</span></p>
<p class="item"><span class="num">5</span><span class="t">이 매뉴얼을 읽기 전에 — 3년의 여정 타임라인</span></p>
<div class="head">프롤로그 「왜 주민이, 왜 종이팩인가」</div>
<p class="item"><span class="num">8</span><span class="t">P-1. 왜 종이팩인가</span></p>
<p class="item"><span class="num">9</span><span class="t">P-2. 왜 주민인가</span></p>
<div class="head">1부. 문제를 발굴하다</div>
<p class="item"><span class="num">12</span><span class="t">1-1. 고산동은 어떤 동네인가</span></p>
<p class="item"><span class="num">13</span><span class="t">1-2. 주민환경연구원이 탄생하다</span></p>
<p class="item"><span class="num">15</span><span class="t">1-3. 동별로 발굴한 세 가지 환경 문제</span></p>
<p class="item"><span class="num">17</span><span class="t">1-4. 종이팩 자원순환을 핵심 주제로 선택하다</span></p>
<div class="head">2부. 모델을 만들다</div>
<p class="item"><span class="num">19</span><span class="t">2-1. 1차년도에서 2차년도로</span></p>
<p class="item"><span class="num">20</span><span class="t">2-2. 세 팀으로 나누어 역할을 정하다</span></p>
<p class="item"><span class="num">21</span><span class="t">2-3. 아파트 회수 모델</span></p>
<p class="item"><span class="num">22</span><span class="t">2-4. 카페·유관기관 회수 모델</span></p>
<p class="item"><span class="num">23</span><span class="t">2-5. 학교·교육기관 회수 모델</span></p>
<p class="item"><span class="num">24</span><span class="t">2-6. 그린고산실천단 거버넌스</span></p>
<p class="item"><span class="num">25</span><span class="t">2-7. 노인일자리와 수거 체계</span></p>
<p class="item"><span class="num">26</span><span class="t">2-8. 방송과 캠페인으로 확산하다</span></p>
<div class="head">3부. 플랫폼을 만들다</div>
<p class="item"><span class="num">28</span><span class="t">3-1. 모델은 완성됐다, 다음을 준비하다</span></p>
<p class="item"><span class="num">30</span><span class="t">3-2. 주민이 그린 고산 앱</span></p>
<p class="item"><span class="num">32</span><span class="t">3-3. 주민이 그린 고산 매뉴얼</span></p>
<p class="item"><span class="num">34</span><span class="t">3-4. 플랫폼이 완성된다는 것</span></p>
""".strip()

TOC_HTML_2 = """
<div class="head">4부. 이렇게 따라 하세요 「종이팩 자원순환 환경리빙랩 실행 가이드」</div>
<p class="item"><span class="num">36</span><span class="t">4-0. 시작하기 전에</span></p>
<p class="item"><span class="num">39</span><span class="t">4-1. 1단계: 주민환경연구원 모집</span></p>
<p class="item"><span class="num">41</span><span class="t">4-2. 2단계: 수거 거점 구축</span></p>
<p class="item"><span class="num">43</span><span class="t">4-3. 3단계: 세척·집하·납품</span></p>
<p class="item"><span class="num">45</span><span class="t">4-4. 4단계: 거버넌스 구축</span></p>
<p class="item"><span class="num">47</span><span class="t">4-5. 현장에서 자주 막히는 문제들</span></p>
<div class="head">5부. 더 완전한 시스템을 향해 「민관 협력으로 완성하는 자원순환」</div>
<p class="item"><span class="num">50</span><span class="t">5-1. 3년의 성과와 남은 과제</span></p>
<p class="item"><span class="num">52</span><span class="t">5-2. 유사사례와 정책 흐름</span></p>
<p class="item"><span class="num">54</span><span class="t">5-3. 고산동과 수성구청의 협력 경과</span></p>
<p class="item"><span class="num">56</span><span class="t">5-4. 협력이 깊어지면 나타나는 변화</span></p>
<p class="item"><span class="num">57</span><span class="t">5-5. 결론</span></p>
<p class="item"><span class="num">59</span><span class="t">에필로그. 같은 실험을 준비하는 이들에게</span></p>
<div class="head">부록</div>
<p class="item"><span class="num">61</span><span class="t">A-0. 용어 설명</span></p>
<p class="item"><span class="num">62</span><span class="t">A-1. 3개년 주요 참여 현황</span></p>
<p class="item"><span class="num">63</span><span class="t">A-2. 연도별 컨소시엄 및 협력기관 목록</span></p>
<p class="item"><span class="num">65</span><span class="t">A-3. 종이팩 자원순환 운영 자료</span></p>
<p class="item"><span class="num">67</span><span class="t">A-4. 실행 양식</span></p>
<p class="item"><span class="num">70</span><span class="t">A-5. 주민환경연구원 명단</span></p>
<p class="item"><span class="num">71</span><span class="t">A-6. 주민환경연구원 소감</span></p>
<p class="item"><span class="num">74</span><span class="t">A-7. 제언</span></p>
<p class="item"><span class="num">75</span><span class="t">A-8. 사진으로 추억하는 주민이 그린 고산 3년</span></p>
<p class="item"><span class="num">78</span><span class="t">A-9. 앱 QR코드 및 문의처</span></p>
""".strip()


def render_page(inner_html, page_no, show_number):
    footer = f'<div class="pnum">{page_no}</div>' if show_number else ""
    return f'<section class="page">{inner_html}{footer}</section>\n'


pages_html = []

for item_id, footer_title, start_page, num_pages, kind, sa, ea in ITEMS:
    if kind == "cover":
        inner = """
        <div class="cover-page">
          <div class="cover-eyebrow">청곡종합사회복지관</div>
          <div class="cover-title">주민이 그린 고산<br>환경리빙랩 매뉴얼</div>
          <div class="cover-sub">주민이 만든 동네 자원순환, 3년의 기록과 실천 가이드</div>
        </div>"""
        pages_html.append(render_page(inner, start_page, False))

    elif kind == "toc":
        p1 = f'<div class="toc-page"><div class="toc-title">목&nbsp;&nbsp;차</div>{TOC_HTML}</div>'
        p2 = f'<div class="toc-page">{TOC_HTML_2}</div>'
        pages_html.append(render_page(p1, start_page, False))
        pages_html.append(render_page(p2, start_page + 1, False))

    elif kind == "divider":
        num, sub = DIVIDER_INFO[item_id]
        sub_html = f'<div class="div-sub">{sub}</div>' if sub else ""
        inner = f'<div class="divider-page"><div class="div-num">{num}</div>{sub_html}</div>'
        pages_html.append(render_page(inner, start_page, False))

    elif kind == "placeholder":
        inner = f'<div class="ph-page"><div class="ph-box">{PLACEHOLDER_TEXT[item_id]}</div></div>'
        for i in range(num_pages):
            pages_html.append(render_page(inner, start_page + i, True))

    elif kind == "content":
        md_blocks = slice_blocks(sa, ea)
        parts = split_evenly(md_blocks, num_pages)
        for i, part in enumerate(parts):
            body_html = to_html(part)
            header = f'<div class="page-kicker">{footer_title}</div>' if i == 0 else ""
            inner = f'<div class="content-page">{header}{body_html}</div>'
            pages_html.append(render_page(inner, start_page + i, True))

    elif kind == "blank":
        pages_html.append(render_page('<div class="content-page"></div>', start_page, False))

    elif kind == "backcover":
        inner = """
        <div class="back-page">
          <div class="back-logo">주민이 그린 고산</div>
          <div class="back-meta">
            발행일 2026년 7월<br>
            발행처 청곡종합사회복지관<br>
            제작 서비스제공팀 · 지역사회조직팀
          </div>
        </div>"""
        pages_html.append(render_page(inner, start_page, False))

STYLE = """
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "맑은 고딕", "Malgun Gothic", "나눔고딕", sans-serif;
    background: #6b6b6b;
    margin: 0;
    padding: 40px 0 120px;
    color: #111;
  }
  .toolbar {
    position: sticky; top: 0; z-index: 10;
    background: #2b2b2b; color: #eee;
    padding: 10px 24px; text-align: center;
    font-size: 12.5px;
  }
  .page {
    width: 720px;
    height: 1018px;
    background: #fff;
    margin: 0 auto 28px;
    box-shadow: 0 6px 20px rgba(0,0,0,.35);
    position: relative;
    padding: 60px 64px 70px;
    overflow: hidden;
    font-size: 11pt;
    line-height: 1.75;
  }
  .pnum {
    position: absolute;
    bottom: 26px; left: 0; right: 0;
    text-align: center;
    font-size: 10pt;
    font-variant-numeric: tabular-nums;
    color: #333;
  }
  .page-kicker {
    font-size: 9.5pt; color: #777; font-weight: 700;
    letter-spacing: .04em; margin-bottom: 14px;
    border-bottom: 1px solid #ccc; padding-bottom: 8px;
  }
  .content-page h1, .content-page h2, .content-page h3, .content-page h4 {
    font-weight: 700; margin: .6em 0 .4em;
  }
  .content-page h1 { font-size: 15pt; }
  .content-page h2 { font-size: 13pt; }
  .content-page h3 { font-size: 11.5pt; }
  .content-page h4 { font-size: 11pt; }
  .content-page p { margin: .5em 0; }
  .content-page table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin: .6em 0; }
  .content-page th, .content-page td { border: 1px solid #999; padding: 5px 7px; text-align: left; vertical-align: top; }
  .content-page blockquote { margin: .5em 0; padding-left: 12px; border-left: 3px solid #ccc; color: #555; }

  .cover-page, .back-page {
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
  }
  .cover-eyebrow { font-size: 11pt; color: #666; letter-spacing: .1em; margin-bottom: 20px; }
  .cover-title { font-size: 26pt; font-weight: 800; line-height: 1.4; margin-bottom: 18px; }
  .cover-sub { font-size: 12.5pt; color: #555; }
  .back-logo { font-size: 15pt; font-weight: 700; margin-bottom: 18px; }
  .back-meta { font-size: 10.5pt; color: #555; line-height: 2; }

  .toc-page { height: 100%; }
  .toc-title { font-size: 22pt; font-weight: 700; letter-spacing: 4px; margin: 0 0 34px; }
  .toc-page .head {
    font-size: 12.5pt; font-weight: 700; border-bottom: 1px solid #111;
    padding-bottom: 5px; margin: 22px 0 4px;
  }
  .toc-page .head:first-child { margin-top: 0; }
  .toc-page p.item { margin: 0; white-space: nowrap; font-size: 10.5pt; }
  .toc-page p.item .num { display: inline-block; width: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .toc-page p.item .t { white-space: normal; }

  .divider-page {
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    background: #1c1c1c; color: #fff; margin: -60px -64px -70px; padding: 60px 64px 70px;
  }
  .div-num { font-size: 30pt; font-weight: 800; letter-spacing: 4px; }
  .div-sub { font-size: 13pt; color: #ccc; margin-top: 14px; }

  .ph-page { height: 100%; display: flex; align-items: center; justify-content: center; }
  .ph-box {
    border: 1.5px dashed #999; border-radius: 4px;
    padding: 40px; text-align: center; color: #555;
    font-size: 13pt; font-weight: 700; line-height: 1.8; width: 100%;
  }
  .ph-box .ph-note { display: block; font-size: 9.5pt; font-weight: 400; color: #888; margin-top: 10px; }

  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .page { box-shadow: none; margin: 0; page-break-after: always; }
  }
</style>
"""

html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>원고 페이지 미리보기 — 주민이 그린 고산 환경리빙랩 매뉴얼</title>
{STYLE}
</head>
<body>
<div class="toolbar">간지·쪽번호 반영 페이지 미리보기 · 절 내부 페이지 분할은 실제 디자인 단계에서 조정될 추정치입니다</div>
{''.join(pages_html)}
</body>
</html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

print("완료:", OUT, "/ 총 페이지:", len(pages_html))
