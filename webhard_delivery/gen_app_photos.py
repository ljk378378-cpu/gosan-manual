# -*- coding: utf-8 -*-
"""public/photo-brief/ 에 넣을 실사진 정적 파일(JPEG) 생성 — /photo-brief 앱 페이지용."""
import os
from PIL import Image, ImageOps

ROOT = "../"
OUT = "../public/photo-brief"
MAXW = 900

FILES = {
    "cover-fb6.jpg": "주민이그린고산 잘나온사진/페이스북 6.jpg",
    "cover-fb4.jpg": "주민이그린고산 잘나온사진/페이스북 4.jpg",
    "cover-energy.jpg": "표지사진 후보.jpeg",
    "foreword.jpg": "메뉴얼 사진/00. 발간사/관장님 사진.png",
    "foreword2.jpg": "메뉴얼 사진/00. 발간사/KakaoTalk_20260704_122653501.png",
    "1-2a.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-1. 1차년도 사업설명회 (1).jpg",
    "1-2b.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-1. 1차년도 사업설명회 (2).jpg",
    "1-3a.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-2. 고산1동 '우유백패킹'.jpg",
    "1-3b.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-3. 고산2동 '쓰레갖기'.jpg",
    "1-3c.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-4. 고산3동 '뿌리덮은 나무'.jpg",
    "1-4a.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-5.  '우유백패킹' 종이팩 제출 (2).JPG",
    "1-4b.jpg": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-5. '우유백패킹'  종이팩 제출 (1).png",
    "2-2a.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-2. 팩누리 팀.jpg",
    "2-2b.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-3. 에코그린 팀.jpg",
    "2-2c.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-4. 요기모다 팀.jpg",
    "2-3-overview.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-1. 회수모델별 종이팩 수거함.jpg",
    "2-3.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-5. 아파트 회수 모델.jpg",
    "2-4.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-6. 카페 회수 모델.jpg",
    "2-5.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-7. 학교.교육기관 회수 모델.jpg",
    "2-6.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-8. Green고산실천단 위촉식.jpg",
    "2-7.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-9. 종이팩 수거단 출범식.jpg",
    "2-7-senior.jpg": "메뉴얼 사진2/IMG_0284.JPG",
    "2-8.jpg": "메뉴얼 사진/2. 2부 모델을 만들다/5-10. MBC 즐거운 오후 2시 라디오 출연.jpg",
    "3-2a.jpg": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-2. 앱 메인 화면.png",
    "3-2b.jpg": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-2. 수거함 위치 지도 화면 .jpg",
    "3-3a.jpg": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-3. 매뉴얼 제작 회의중인 팩도리팩수니 팀.jpg",
    "3-3b.jpg": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-3. 앱 검증 활동.jpg",
    "5-3a.jpg": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20250626_134102904.jpg",
    "5-3b.jpg": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20250626_134102904_01.jpg",
    "5-4.jpg": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20260704_174553579.jpg",
    "gallery1.jpg": "메뉴얼 사진/7. 부록/발대식 (1).jpg",
    "gallery2.jpg": "메뉴얼 사진/7. 부록/발대식 (4).jpg",
    "gallery3.jpg": "메뉴얼 사진/7. 부록/제1회 환경교육아카데미.jpg",
    "gallery4.jpg": "메뉴얼 사진/7. 부록/1차 팝업환경도서관.JPG",
}

os.makedirs(OUT, exist_ok=True)
for out_name, rel in FILES.items():
    im = Image.open(ROOT + rel)
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    if w > MAXW:
        h = int(h * MAXW / w)
        w = MAXW
        im = im.resize((w, h), Image.LANCZOS)
    im.save(os.path.join(OUT, out_name), format="JPEG", quality=82)
    print(out_name, f"{w}x{h}")

print("done:", len(FILES), "files ->", OUT)
