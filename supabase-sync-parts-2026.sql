-- Existing Supabase DB sync: align parts with README 12-part / 63p structure.
-- Run this once in Supabase SQL Editor if the live DB still has the older 9-part draft.

begin;

update parts
set order_num = 3,
    title = '발간사',
    subtitle = '청곡종합사회복지관 관장·수성구청 담당 국장',
    page_count = 2,
    assignee = '이진규',
    updated_at = now()
where title = '발간사';

update parts
set order_num = 4,
    title = '이 매뉴얼을 읽기 전에',
    subtitle = '3년의 여정 타임라인',
    page_count = 2,
    assignee = '이진규',
    updated_at = now()
where title = '이 매뉴얼을 읽기 전에';

update parts
set order_num = 5,
    title = '프롤로그',
    subtitle = '왜 주민이, 왜 종이팩인가?',
    page_count = 4,
    assignee = '김연수',
    updated_at = now()
where title = '프롤로그';

update parts
set order_num = 6,
    title = '1부: 문제를 발굴하다',
    subtitle = '1차년도 이야기 (2023.8~2024.7)',
    page_count = 8,
    assignee = '이현직',
    updated_at = now()
where title like '1부:%';

update parts
set order_num = 7,
    title = '2부: 모델을 만들다',
    subtitle = '2차년도 이야기 (2024.8~2025.7)',
    page_count = 10,
    assignee = '김정현',
    updated_at = now()
where title like '2부:%';

update parts
set order_num = 9,
    title = '4부: 이렇게 따라 하세요',
    subtitle = '종이팩 자원순환 환경리빙랩 실행 가이드',
    page_count = 12,
    assignee = '이승원',
    updated_at = now()
where title in ('3부: 이렇게 따라 하세요', '4부: 이렇게 따라 하세요');

update parts
set order_num = 10,
    title = '5부: 더 완전한 시스템을 향해',
    subtitle = '민관 협력으로 완성하는 자원순환',
    page_count = 8,
    assignee = '이진규',
    updated_at = now()
where title in ('4부: 지자체가 함께해야 한다', '5부: 더 완전한 시스템을 향해');

update parts
set order_num = 11,
    title = '에필로그',
    subtitle = '다음 지역에 건네는 마지막 목소리',
    page_count = 2,
    assignee = '김연수',
    updated_at = now()
where title = '에필로그';

update parts
set order_num = 12,
    title = '부록',
    subtitle = '연도별 활동일지·연구원 명단·용어 설명',
    page_count = 4,
    assignee = '이승원',
    updated_at = now()
where title = '부록';

insert into parts (order_num, title, subtitle, page_count, assignee, progress, status)
select 1, '내지 표지', '사업명·기관명·발행연도', 1, null, 0, 'pending'
where not exists (select 1 from parts where order_num = 1 and title = '내지 표지');

insert into parts (order_num, title, subtitle, page_count, assignee, progress, status)
select 2, '목차', '파트별 제목과 최종 페이지 번호', 2, null, 0, 'pending'
where not exists (select 1 from parts where order_num = 2 and title = '목차');

insert into parts (order_num, title, subtitle, page_count, assignee, progress, status)
select 8, '3부: 플랫폼을 만들다', '3차년도 이야기 (2025.8~2026.7)', 8, '이진규', 0, 'pending'
where not exists (select 1 from parts where order_num = 8 and title = '3부: 플랫폼을 만들다');

commit;
