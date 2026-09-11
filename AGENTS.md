<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 청곡 AI 업무시스템 작업 원칙

- 새 탭이나 기능을 만들 때 기존 공통 메뉴, 로그인, 저장, PDF 뷰어, 화면 구성요소를 우선 재사용한다.
- 요청받은 탭과 직접 관련된 파일만 먼저 확인하며, 필요하지 않은 전체 저장소 재검색과 대용량 PDF 전체 분석은 피한다.
- PDF는 원본을 수정하지 않고 읽기 전용으로 사용하며, 필요한 파일과 관련 쪽만 확인한다.
- 단순 문구·화면 수정과 반복 작업은 효율적인 방식으로 처리하고, 전체 구조 점검이나 복잡한 오류에만 높은 수준의 분석을 사용한다.
- 관련된 작은 수정은 가능한 범위에서 한 번에 모아 검증하고 배포하여 반복 빌드와 배포를 줄인다.
- 기존에 정상 작동하는 내용은 불필요하게 다시 작성하지 않으며, 수정 범위와 영향을 최소화한다.
- 로컬 검증 후 Git에 반영하고, Vercel 배포가 필요한 경우 최종 서비스 화면까지 한 번만 검증한다.
- 새 기능이 추가되어도 사용자가 브라우저에서 직접 조회·입력하는 일반 동작에는 AI 호출을 추가하지 않는다. AI 기능을 새로 연결해야 할 때는 사용량과 비용을 먼저 설명하고 승인을 받는다.
