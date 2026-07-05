# -*- coding: utf-8 -*-
"""'메뉴얼 사진' / '메뉴얼 사진2' 폴더의 실사진을 썸네일 base64로 변환해 datauris2.json 생성."""
import json, base64, io
from PIL import Image, ImageOps

ROOT = "../"  # gosan-manual 루트 기준 상대경로 (webhard_delivery/ 안에서 실행)

FILES = {
    "cover1": "메뉴얼 사진2/IMG_0284.JPG",
    "cover2": "메뉴얼 사진2/IMG_4769.JPG",
    "fw1": "메뉴얼 사진/00. 발간사/관장님 사진.png",
    "fw2": "메뉴얼 사진/00. 발간사/KakaoTalk_20260704_122653501.png",
    "p1_2a": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-1. 1차년도 사업설명회 (1).jpg",
    "p1_2b": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-1. 1차년도 사업설명회 (2).jpg",
    "p1_3a": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-2. 고산1동 '우유백패킹'.jpg",
    "p1_3b": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-3. 고산2동 '쓰레갖기'.jpg",
    "p1_3c": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-4. 고산3동 '뿌리덮은 나무'.jpg",
    "p1_4a": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-5.  '우유백패킹' 종이팩 제출 (2).JPG",
    "p1_4b": "메뉴얼 사진/1. 1부 문제를 발굴하다/4-5. '우유백패킹'  종이팩 제출 (1).png",
    "p2_2a": "메뉴얼 사진/2. 2부 모델을 만들다/5-2. 팩누리 팀.jpg",
    "p2_2b": "메뉴얼 사진/2. 2부 모델을 만들다/5-3. 에코그린 팀.jpg",
    "p2_2c": "메뉴얼 사진/2. 2부 모델을 만들다/5-4. 요기모다 팀.jpg",
    "p2_3a": "메뉴얼 사진/2. 2부 모델을 만들다/5-5. 아파트 회수 모델.jpg",
    "p2_3b": "메뉴얼 사진/2. 2부 모델을 만들다/5-1. 회수모델별 종이팩 수거함.jpg",
    "p2_4": "메뉴얼 사진/2. 2부 모델을 만들다/5-6. 카페 회수 모델.jpg",
    "p2_5": "메뉴얼 사진/2. 2부 모델을 만들다/5-7. 학교.교육기관 회수 모델.jpg",
    "p2_6": "메뉴얼 사진/2. 2부 모델을 만들다/5-8. Green고산실천단 위촉식.jpg",
    "p2_7": "메뉴얼 사진/2. 2부 모델을 만들다/5-9. 종이팩 수거단 출범식.jpg",
    "p2_8": "메뉴얼 사진/2. 2부 모델을 만들다/5-10. MBC 즐거운 오후 2시 라디오 출연.jpg",
    "p3_2a": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-2. 앱 메인 화면.png",
    "p3_2b": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-2. 수거함 위치 지도 화면 .jpg",
    "p3_3a": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-3. 매뉴얼 제작 회의중인 팩도리팩수니 팀.jpg",
    "p3_3b": "메뉴얼 사진/3. 3부 플랫폼을 만들다/3-3. 앱 검증 활동.jpg",
    "p5_3a": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20250626_134102904.jpg",
    "p5_3b": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20250626_134102904_01.jpg",
    "p5_4a": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20260704_174553579.jpg",
    "p5_4b": "메뉴얼 사진/5. 5부 더 완전한 시스템을 향해/KakaoTalk_20260704_174553579_01.jpg",
    "g1": "메뉴얼 사진/7. 부록/발대식 (1).jpg",
    "g2": "메뉴얼 사진/7. 부록/발대식 (4).jpg",
    "g3": "메뉴얼 사진/7. 부록/제1회 환경교육아카데미.jpg",
    "g4": "메뉴얼 사진/7. 부록/1차 팝업환경도서관.JPG",
}

MAXW = 480

out = {}
for key, rel in FILES.items():
    path = ROOT + rel
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ("RGB",):
        im = im.convert("RGB")
    w, h = im.size
    if w > MAXW:
        h = int(h * MAXW / w)
        w = MAXW
        im = im.resize((w, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=72)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    out[key] = f"data:image/jpeg;base64,{b64}"
    print(key, len(b64), "bytes(b64)")

with open("datauris2.json", "w", encoding="utf-8") as f:
    json.dump(out, f)
print("done:", len(out), "images")
