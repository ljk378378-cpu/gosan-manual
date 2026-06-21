-- 파트 진행현황 테이블
create table parts (
  id serial primary key,
  order_num integer not null,
  title text not null,
  subtitle text,
  page_count integer default 0,
  assignee text,
  progress integer default 0,
  status text default 'pending', -- pending / in_progress / review / done
  notes text,
  updated_at timestamptz default now()
);

-- 데일리 업데이트 테이블
create table daily_updates (
  id serial primary key,
  part_id integer references parts(id),
  author text not null,
  content text not null,
  update_type text default 'progress', -- progress / issue / milestone
  created_at timestamptz default now()
);

-- 의견 게시판
create table comments (
  id serial primary key,
  author text not null,
  author_role text default 'team', -- team / researcher / practitioner
  part_id integer references parts(id),
  content text not null,
  created_at timestamptz default now()
);

-- 초기 파트 데이터
insert into parts (order_num, title, subtitle, page_count, assignee, progress, status) values
(1, '내지 표지', '사업명·기관명·발행연도', 1, null, 0, 'pending'),
(2, '목차', '파트별 제목과 최종 페이지 번호', 2, null, 0, 'pending'),
(3, '발간사', '청곡종합사회복지관 관장·수성구청 담당 국장', 2, '이진규', 0, 'pending'),
(4, '이 매뉴얼을 읽기 전에', '3년의 여정 타임라인', 2, '이진규', 0, 'pending'),
(5, '프롤로그', '왜 주민이, 왜 종이팩인가?', 4, '김연수', 0, 'pending'),
(6, '1부: 문제를 발굴하다', '1차년도 이야기 (2023.8~2024.7)', 8, '이현직', 0, 'pending'),
(7, '2부: 모델을 만들다', '2차년도 이야기 (2024.8~2025.7)', 10, '김정현', 0, 'pending'),
(8, '3부: 플랫폼을 만들다', '3차년도 이야기 (2025.8~2026.7)', 8, '이진규', 0, 'pending'),
(9, '4부: 이렇게 따라 하세요', '종이팩 자원순환 환경리빙랩 실행 가이드', 12, '이승원', 0, 'pending'),
(10, '5부: 더 완전한 시스템을 향해', '민관 협력으로 완성하는 자원순환', 8, '이진규', 0, 'pending'),
(11, '에필로그', '다음 지역에 건네는 마지막 목소리', 2, '김연수', 0, 'pending'),
(12, '부록', '연도별 활동일지·연구원 명단·용어 설명', 4, '이승원', 0, 'pending');

-- Realtime 활성화
alter table daily_updates replica identity full;
alter table comments replica identity full;
alter table parts replica identity full;
