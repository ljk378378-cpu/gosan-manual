'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PdfCanvasReader from '@/components/PdfCanvasReader'

type Topic = {
  day: number
  stage: 1 | 2 | 3
  guide: 'facility' | 'labor' | 'inspection'
  page: number
  area: string
  title: string
  keyPoint: string
  managerQuestion: string
  evidence: string
}

type TopicSeed = Omit<Topic, 'stage' | 'guide' | 'page'>

type LearningRecord = {
  id: string
  date: string
  topic: string
  learned: string
  institutionRule: string
  workApply: string
  question: string
}
type LatestRecord = {
  id: string
  date: string
  title: string
  source: string
  summary: string
  impact: string
  question?: string
  action: string
}
type Material = {
  source: string
  href: string
  read: string[]
  practice: string
}
type ChapterSection = {
  heading: string
  body: string
}

const STORAGE_KEY = 'cheonggok-hr-labor-learning-v1'
const LATEST_KEY = 'cheonggok-hr-labor-latest-v1'
const PROGRESS_KEY = 'cheonggok-hr-labor-progress-v2'

const guideRoadmap = [
  { stage: 1, phase: '1단계 · 1~30일', title: '2026 사회복지시설 관리안내', detail: '시설 현황부터 운영·종사자·전자화·안전·회계·후원금·인건비까지 전체 목차를 읽습니다.' },
  { stage: 2, phase: '2단계 · 31~60일', title: '사회복지관 인사노무 길라잡이', detail: '근로계약, 임금, 근로시간, 휴가, 징계와 괴롭힘을 실제 노무사례 중심으로 익힙니다.' },
  { stage: 3, phase: '3단계 · 61~90일', title: '2025 지도점검 사례집', detail: '실제 지적사례를 통해 시설운영, 종사자, 회계, 후원금과 기능보강 위험을 점검합니다.' },
]

const stageOneSeeds: TopicSeed[] = [
  { day: 1, area: '개정사항', title: '관리안내의 성격과 2026년 주요 변경', keyPoint: '관리안내의 적용범위와 2026년 변경사항을 먼저 구분한다.', managerQuestion: '올해 변경사항 중 우리 기관 규정이나 운영에 반영할 항목은 무엇인가?', evidence: '2026 관리안내, 전년도 대비표, 기관 규정' },
  { day: 2, area: '시설현황', title: '사회복지시설의 정의와 적용대상', keyPoint: '명칭보다 실제 수행사업과 법적 설치근거로 시설 여부를 판단한다.', managerQuestion: '우리 기관의 법적 설치근거와 시설유형을 설명할 수 있는가?', evidence: '설치신고증, 위탁협약, 사업자등록증' },
  { day: 3, area: '시설현황', title: '사회복지시설의 종류와 개별법 우선', keyPoint: '시설유형별 소관 법률과 개별 사업지침이 공통안내보다 우선할 수 있다.', managerQuestion: '복지관에 우선 적용되는 개별 법령과 지침은 정리되어 있는가?', evidence: '사회복지사업법, 복지관 운영지침, 시설현황표' },
  { day: 4, area: '설치', title: '시설 설치·신고와 인정기준', keyPoint: '인적·물적 기준과 신고 절차, 고유번호증 발급을 연결해 확인한다.', managerQuestion: '시설 설치와 변경 신고자료가 최신 상태인가?', evidence: '설치신고증, 변경신고, 고유번호증' },
  { day: 5, area: '운영', title: '시설 운영의 기본원칙과 투명성', keyPoint: '운영주체의 책임, 보조금 집행, 공개와 보고 의무를 실제 운영에 반영한다.', managerQuestion: '운영의 투명성을 보여주는 핵심 문서를 즉시 제시할 수 있는가?', evidence: '운영규정, 예산결산, 공시자료' },
  { day: 6, area: '운영위원회', title: '운영위원회 구성과 심의·보고', keyPoint: '위원 구성, 회의 주기, 심의·보고사항과 결과 반영을 구분한다.', managerQuestion: '최근 운영위원회가 필수 안건을 빠짐없이 다뤘는가?', evidence: '위원명단, 소집통지, 회의록, 결과보고' },
  { day: 7, area: '인건비', title: '인건비 보조금 지급연령과 예외', keyPoint: '시설장·종사자 지급상한과 2026년 특례를 정확히 구분한다.', managerQuestion: '지급연령 상한과 예외 적용 대상자가 있는가?', evidence: '직원명부, 생년월일, 인건비 지급자료' },
  { day: 8, area: '채용', title: '공개채용과 공정한 절차', keyPoint: '공고, 심사, 면접, 결과와 채용서류가 하나의 흐름으로 남아야 한다.', managerQuestion: '최근 채용 건의 전 과정을 증빙할 수 있는가?', evidence: '채용공고, 심사표, 위원명단, 결과공고' },
  { day: 9, area: '종사자', title: '임면보고·결격사유와 자격 확인', keyPoint: '채용 전 자격과 결격사유를 확인하고 임면사항을 기한 내 보고한다.', managerQuestion: '모든 직원의 임면보고와 조회자료가 갖춰져 있는가?', evidence: '임면보고, 자격증, 범죄·결격 조회자료' },
  { day: 10, area: '권익', title: '사회복지시설 종사자 권익보호', keyPoint: '공익신고자 보호, 직장 내 괴롭힘과 폭력 피해 지원체계를 알아둔다.', managerQuestion: '직원이 권익침해를 신고할 수 있는 내부·외부 경로를 알고 있는가?', evidence: '신고절차, 권익지원 안내, 예방교육 자료' },
  { day: 11, area: '종사자', title: '종사자 관리자료와 개인정보', keyPoint: '인사기록의 필수성, 접근권한과 보관·폐기 기준을 함께 관리한다.', managerQuestion: '인사자료 접근권한과 보관위치를 설명할 수 있는가?', evidence: '인사기록카드, 권한목록, 보관대장' },
  { day: 12, area: '인건비', title: '인건비 보조금 지급기준', keyPoint: '보조금 지급대상과 제외항목, 지자체 기준을 구분해 적용한다.', managerQuestion: '인건비 지급대상과 재원별 기준이 급여자료와 일치하는가?', evidence: '인건비 교부조건, 급여대장, 직원명부' },
  { day: 13, area: '시설운영', title: '시설 휴지·재개·자진폐지', keyPoint: '이용자 보호와 종사자 조치, 신고 절차를 사전에 이해한다.', managerQuestion: '운영중단 상황에서 이용자와 종사자를 보호할 절차가 있는가?', evidence: '비상운영계획, 신고서식, 인계자료' },
  { day: 14, area: '행정처분', title: '사회복지시설 행정처분 기준', keyPoint: '위반행위별 처분기준과 가중·감경 가능성을 구분한다.', managerQuestion: '우리 기관에서 행정처분으로 이어질 수 있는 위험은 무엇인가?', evidence: '자체점검표, 시정조치 기록, 관련 규정' },
  { day: 15, area: '지도감독', title: '시설 지도·감독과 자료제출', keyPoint: '감독기관의 권한과 시설의 보고·자료제출 의무를 이해한다.', managerQuestion: '점검 요청자료를 정확한 수치로 즉시 제출할 수 있는가?', evidence: '지도점검표, 제출공문, 시정결과' },
  { day: 16, area: '평가', title: '사회복지시설 평가와 사후관리', keyPoint: '평가대상, 결과공개와 미흡시설 사후관리 흐름을 이해한다.', managerQuestion: '2027년 평가 준비가 실제 운영개선으로 연결되고 있는가?', evidence: '평가지표, 자체평가, 개선계획' },
  { day: 17, area: '사회복무', title: '사회복무요원 배치와 복무관리', keyPoint: '배치 목적과 업무범위, 출퇴근·교육·사고 관리를 구분한다.', managerQuestion: '사회복무요원의 업무가 허용범위 안에서 관리되는가?', evidence: '복무기록, 업무분장, 교육자료' },
  { day: 18, area: '신고의무', title: '실종아동 발견 신고와 신상카드', keyPoint: '대상자 발견 시 신고와 신상카드 제출의무를 숙지한다.', managerQuestion: '해당 상황 발생 시 담당자와 즉시 행동절차가 정해져 있는가?', evidence: '신고절차, 신상카드 서식, 직원교육' },
  { day: 19, area: '전자화', title: '사회복지시설 업무 전자화', keyPoint: '전자 시스템의 보고자료와 기관 원자료가 일치해야 한다.', managerQuestion: '전자보고 수치와 내부 장부가 서로 맞는가?', evidence: '전자보고 내역, 내부대장, 권한목록' },
  { day: 20, area: '희망이음', title: '희망이음 활용과 사용자 권한', keyPoint: '업무별 권한을 최소화하고 인사이동 시 즉시 변경·회수한다.', managerQuestion: '퇴사자와 겸직자의 시스템 권한이 적절한가?', evidence: '사용자명부, 권한현황, 회수기록' },
  { day: 21, area: '전자보고', title: '온라인 보고와 보고기한', keyPoint: '입퇴사, 보조금, 예결산 등 보고항목과 기한을 일정으로 관리한다.', managerQuestion: '정기·수시 온라인 보고의 담당자와 마감일이 정리되어 있는가?', evidence: '보고일정표, 제출내역, 승인기안' },
  { day: 22, area: '안전', title: '보험가입과 배상책임', keyPoint: '시설과 이용자·종사자 위험에 필요한 보험의 보장범위를 확인한다.', managerQuestion: '현재 보험이 시설의 실제 위험과 인원을 모두 보장하는가?', evidence: '보험증권, 가입자명부, 보장내역' },
  { day: 23, area: '안전', title: '정기·수시 시설안전점검', keyPoint: '계절과 재난유형별 점검, 시정조치와 재확인을 기록한다.', managerQuestion: '최근 안전점검의 미비사항이 실제로 조치되었는가?', evidence: '안전점검표, 사진, 보수내역' },
  { day: 24, area: '안전', title: '안전인력·교육·재난훈련', keyPoint: '안전관리 책임과 교육·훈련 결과를 실제 대응체계로 연결한다.', managerQuestion: '직원이 재난 발생 시 자신의 역할을 알고 있는가?', evidence: '안전계획, 교육일지, 훈련결과' },
  { day: 25, area: '회계', title: '재무회계규칙의 기본원칙', keyPoint: '회계연도, 출납기한, 회계 구분과 책임자를 정확히 적용한다.', managerQuestion: '기관 회계 처리의 권한과 책임이 분리되어 있는가?', evidence: '회계규정, 회계관계 직원 지정, 장부' },
  { day: 26, area: '예산', title: '예산·추경·결산 절차', keyPoint: '편성, 심의, 승인, 보고·공고의 순서와 기한을 지킨다.', managerQuestion: '최근 예산변경이 필요한 절차를 모두 거쳤는가?', evidence: '예산서, 추경, 결산서, 회의록' },
  { day: 27, area: '회계', title: '수입·지출·물품 관리', keyPoint: '결의, 증빙, 검수, 자산등록과 재물조사를 연결한다.', managerQuestion: '표본 거래 한 건이 장부부터 자산대장까지 이어지는가?', evidence: '결의서, 증빙철, 물품·자산대장' },
  { day: 28, area: '후원금', title: '후원금 관리와 감사', keyPoint: '영수증, 지정용도, 사용결과 보고·공개와 감사를 지킨다.', managerQuestion: '후원금 수입과 사용내역을 후원자와 점검기관에 설명할 수 있는가?', evidence: '후원금대장, 영수증, 결과보고, 감사자료' },
  { day: 29, area: '운영규정', title: '운영위원회·위탁운영 부록 적용', keyPoint: '예시 규정을 그대로 복사하지 않고 기관 규정과 위탁협약에 맞게 적용한다.', managerQuestion: '기관 운영규정과 위탁협약이 최신 관리안내와 일치하는가?', evidence: '운영규정, 위탁협약, 신구대조표' },
  { day: 30, area: '호봉', title: '인건비 가이드라인과 경력인정', keyPoint: '직종별 인건비 기준과 경력인정 범위, 호봉획정 근거를 연결한다.', managerQuestion: '직원별 호봉을 최신 경력인정 기준으로 설명할 수 있는가?', evidence: '인건비 가이드라인, 경력증명서, 호봉획정표' },
]

type CourseSeed = [area: string, title: string, keyPoint: string, evidence: string, page: number]

function makeStageTopics(stage: 2 | 3, guide: 'labor' | 'inspection', startDay: number, seeds: CourseSeed[]): Topic[] {
  return seeds.map(([area, title, keyPoint, evidence, page], index) => ({
    day: startDay + index,
    stage,
    guide,
    page,
    area,
    title,
    keyPoint,
    managerQuestion: `우리 기관에서 ${title} 기준을 실제 문서와 절차로 설명할 수 있는가?`,
    evidence,
  }))
}

const stageTwoTopics = makeStageTopics(2, 'labor', 31, [
  ['기초', '노동관계법의 적용 순서', '법률, 취업규칙, 근로계약, 기관 관행이 충돌할 때 적용 순서를 구분한다.', '근로계약서, 취업규칙, 운영규정', 10],
  ['근로계약', '근로계약서 필수 기재사항', '임금, 근로시간, 휴일, 휴가와 업무내용을 서면으로 명확히 남긴다.', '근로계약서, 업무분장표', 14],
  ['근로계약', '수습기간과 본채용 판단', '수습 적용 근거와 평가기준, 본채용 거부 절차를 사전에 명확히 한다.', '근로계약서, 수습평가표, 인사기안', 18],
  ['근로계약', '기간제 계약과 갱신기대권', '반복 갱신과 기관의 언행이 갱신 기대를 만들 수 있음을 이해한다.', '기간제 계약서, 갱신기안, 평가기록', 21],
  ['채용', '채용내정과 취소', '합격 통보 이후 취소는 해고와 유사한 분쟁으로 이어질 수 있어 근거와 절차가 필요하다.', '채용공고, 합격통보, 취소 검토자료', 24],
  ['인사', '전보·전직과 업무변경', '업무상 필요성과 직원 불이익을 함께 검토하고 변경 사유를 기록한다.', '인사발령, 업무분장, 협의기록', 27],
  ['인사', '휴직과 복직 관리', '휴직 사유, 기간, 급여·보험 처리와 복직 절차를 하나의 일정으로 관리한다.', '휴직원, 승인기안, 복직원, 보험자료', 30],
  ['임금', '임금의 범위와 지급 원칙', '정기적·일률적으로 지급되는 금품의 성격과 지급 원칙을 구분한다.', '보수규정, 급여대장, 수당기준', 36],
  ['임금', '통상임금과 평균임금', '시간외수당과 퇴직금 산정에서 사용하는 임금 기준의 차이를 이해한다.', '급여명세서, 수당내역, 산정표', 39],
  ['임금', '연장·야간·휴일근로수당', '실제 근로시간과 사전명령, 가산수당 산정이 일치해야 한다.', '시간외명령서, 근무기록, 급여대장', 44],
  ['임금', '가족수당과 기관 수당', '지급요건, 중복수령 확인, 변동신고와 환수 절차를 명확히 한다.', '가족수당 신청서, 확인서, 급여대장', 49],
  ['임금', '임금명세서와 공제', '지급항목과 공제항목의 근거를 직원이 이해할 수 있게 명세한다.', '임금명세서, 공제동의서, 급여대장', 52],
  ['근로시간', '법정근로시간과 소정근로시간', '계약상 근로시간과 실제 근무시간을 구분하고 일·주 단위로 관리한다.', '근로계약서, 출퇴근기록, 근무표', 56],
  ['근로시간', '휴게시간의 실질 보장', '휴게시간에는 업무 지시나 대기가 없어야 하며 자유로운 이용이 가능해야 한다.', '근무표, 휴게운영 기준, 직원 안내', 59],
  ['근로시간', '출장·교육·행사 시간 판단', '이동과 대기, 교육 및 행사 참여가 근로시간인지 구체적 지휘 여부로 판단한다.', '출장명령, 교육계획, 행사근무표', 62],
  ['휴일', '주휴일과 공휴일 운영', '근무형태별 주휴일과 공휴일 근무 처리기준을 사전에 정한다.', '복무규정, 근무표, 휴일근무명령', 65],
  ['연차', '연차휴가 발생과 산정', '입사일과 회계연도 기준의 차이, 중도입사·퇴사자의 일수를 정확히 계산한다.', '연차대장, 입사일 자료, 산정표', 68],
  ['연차', '연차 사용촉진과 미사용수당', '법정 절차와 시기를 지킨 사용촉진 기록이 있어야 한다.', '사용촉진 통보, 연차대장, 수당정산', 72],
  ['휴가', '병가·공가·특별휴가 적용', '법정휴가와 기관 약정휴가를 구분하고 증빙요건을 통일한다.', '복무규정, 휴가신청서, 증빙자료', 76],
  ['퇴직', '사직서와 퇴직일 확정', '사직 의사, 수리 여부, 인수인계와 마지막 근무일을 명확히 남긴다.', '사직서, 퇴직기안, 인수인계서', 82],
  ['퇴직', '퇴직금과 퇴직연금 정산', '계속근로기간과 평균임금, 적립액과 지급기한을 확인한다.', '퇴직연금 내역, 산정서, 지급자료', 86],
  ['징계', '업무지도와 징계의 구분', '일상적 피드백과 공식 제재를 구분하고 사실과 개선기회를 기록한다.', '업무지도 기록, 인사규정, 경위서', 90],
  ['징계', '징계사유와 소명 절차', '사유의 구체성, 비례성, 소명기회와 위원회 절차를 지켜야 한다.', '소명안내, 인사위원회 회의록, 통보서', 94],
  ['해고', '해고의 정당한 이유와 서면통지', '해고 사유와 시기를 서면으로 통지하고 절차적 정당성을 확보한다.', '해고통지서, 조사자료, 회의록', 98],
  ['인권', '직장 내 괴롭힘 판단', '우위성, 업무상 적정범위, 고통 또는 근무환경 악화를 종합해 판단한다.', '신고서, 사실확인서, 조사계획', 108],
  ['인권', '괴롭힘 조사와 보호조치', '비밀유지, 분리조치, 공정한 조사와 신고자 불이익 금지를 지킨다.', '조사기록, 보호조치, 결과통보', 118],
  ['모성보호', '출산·육아와 근로자 보호', '휴가·휴직·단축근무의 신청과 복귀, 불리한 처우 금지를 관리한다.', '신청서, 승인기안, 복귀계획', 128],
  ['노사관계', '취업규칙 작성과 불이익 변경', '적용 인원과 신고의무, 직원 의견청취·동의 요건을 구분한다.', '취업규칙, 의견서, 신고자료', 140],
  ['개인정보', '직원 개인정보와 CCTV', '수집 목적과 보유기간, 접근권한, 영상정보 처리기준을 명확히 한다.', '동의서, 처리방침, 권한목록', 154],
  ['종합', '인사노무 사례 종합점검', '계약·임금·시간·휴가·징계의 연결관계를 실제 사례로 설명한다.', '30일 학습기록, 개선과제, 규정대조표', 170],
])

const stageThreeTopics = makeStageTopics(3, 'inspection', 61, [
  ['시설운영', '법인·시설의 목적과 사업범위', '정관과 시설의 실제 사업이 허가받은 목적 범위 안에 있어야 한다.', '정관, 설치신고증, 사업계획서', 5],
  ['시설운영', '기본재산과 보통재산 관리', '재산 구분과 처분·용도변경 승인 절차를 확인한다.', '재산대장, 이사회 회의록, 허가자료', 11],
  ['시설운영', '정관 변경과 등기', '변경 승인, 등기, 보고가 정해진 기한과 절차에 맞아야 한다.', '정관, 변경허가, 등기부등본', 16],
  ['시설운영', '임원 구성과 결격사유', '임원 선임요건과 특수관계, 결격사유 확인자료를 갖춘다.', '임원명부, 결격조회, 취임승낙서', 21],
  ['시설운영', '이사회 소집과 의결', '소집통지, 의사정족수, 이해관계자 제외와 회의록을 확인한다.', '소집통지, 출석부, 이사회 회의록', 27],
  ['시설운영', '운영위원회 구성과 보고', '위원 구성, 정기회의, 보고·심의사항과 결과 반영을 관리한다.', '위원명단, 회의록, 결과보고', 34],
  ['시설운영', '시설장과 종사자 자격', '법정 자격과 결격사유, 겸직 여부를 임용 전에 확인한다.', '자격증, 경력증명, 결격조회', 41],
  ['시설운영', '시설 설치·변경 신고', '명칭, 소재지, 정원과 주요 운영사항 변경을 적기에 신고한다.', '설치신고증, 변경신고, 수리통보', 48],
  ['시설운영', '지도감독 자료 제출', '요청자료의 수치와 근거가 일치하고 제출본을 보관해야 한다.', '제출공문, 점검표, 제출자료 사본', 56],
  ['시설운영', '위탁운영과 협약 준수', '위탁협약의 인력·예산·성과·보고 의무를 실제 운영과 대조한다.', '위탁협약서, 사업계획, 실적보고', 64],
  ['종사자', '공개채용 점검사례', '공고기간, 게시처, 심사절차와 채점근거가 모두 남아야 한다.', '채용공고, 심사표, 결과공고', 72],
  ['종사자', '근로계약과 인사기록 점검', '계약내용과 실제 근무조건, 인사기록이 일치해야 한다.', '근로계약서, 인사기록카드, 발령문', 74],
  ['종사자', '경력인정과 호봉 점검', '인정 가능한 경력과 증빙, 승인된 호봉획정표를 대조한다.', '경력증명서, 호봉획정표, 승인기안', 76],
  ['종사자', '인건비·수당 부적정 사례', '지급대상과 산정기준, 중복 또는 과다 지급 위험을 확인한다.', '급여대장, 수당신청서, 지급기준', 78],
  ['종사자', '복무·출장·시간외 점검', '사전명령과 실제 수행, 결과보고, 지급내역이 연결되어야 한다.', '복무대장, 출장복명, 시간외 자료', 80],
  ['종사자', '퇴직·보험·적립 점검', '입퇴사일과 보험 신고, 퇴직연금 적립·정산 자료를 맞춘다.', '보험신고, 퇴직정산, 적립내역', 82],
  ['회계', '예산 편성과 승인', '세입·세출 예산, 추경, 이사회·운영위원회 절차를 지킨다.', '예산서, 회의록, 승인공문', 83],
  ['회계', '수입·지출 결의와 증빙', '모든 거래는 결의서, 계약·견적, 영수증과 회계처리가 연결되어야 한다.', '수입지출결의서, 증빙철, 장부', 86],
  ['회계', '보조금 목적 외 사용 방지', '재원별 목적과 집행기준을 구분하고 전용·변경승인을 확인한다.', '교부조건, 사업계획, 변경승인', 89],
  ['회계', '카드·현금·계좌 관리', '법인카드와 통장, 현금 사용은 사적 사용 없이 대장과 일치해야 한다.', '카드대장, 통장, 현금출납부', 92],
  ['회계', '계약과 비교견적', '계약방법과 견적, 검수, 대금지급 절차를 금액 기준에 맞게 적용한다.', '계약서, 견적서, 검수조서', 95],
  ['회계', '결산과 잔액 반납', '결산 수치와 통장·장부 잔액을 맞추고 반납기한을 지킨다.', '결산서, 통장사본, 반납공문', 98],
  ['후원금', '후원금 수입과 영수증', '후원자 정보와 입금액, 영수증 발급내역이 일치해야 한다.', '후원금대장, 영수증, 통장', 100],
  ['후원금', '지정·비지정 후원금 사용', '후원 목적과 사용 제한, 비지정 후원금 기준을 구분한다.', '후원신청서, 사용내역, 결의서', 102],
  ['후원금', '후원금 결과보고와 공개', '수입·사용결과 보고와 공개기한, 개인정보 비공개를 확인한다.', '결과보고, 공개화면, 발송자료', 105],
  ['기능보강', '기능보강사업 집행 절차', '교부조건과 계약·공사·납품·검수 절차를 순서대로 관리한다.', '교부결정, 계약서, 검수조서', 107],
  ['기능보강', '자산 취득과 물품관리', '취득 물품을 자산대장에 등록하고 표찰·재물조사를 실시한다.', '자산대장, 물품검수, 재물조사표', 110],
  ['Q&A', '법인·시설운영 질의 적용', '사례 답변을 기관에 그대로 적용하지 않고 최신 법령과 사실관계를 대조한다.', '사례집, 기관 규정, 검토메모', 114],
  ['Q&A', '종사자·회계 질의 적용', '반복 문의를 기관 공통 처리기준과 점검표로 바꾼다.', '질의회신, 업무기준, 자체점검표', 116],
  ['종합', '90일 학습과 기관 개선계획', '세 교재의 기준과 사례를 규정 개정, 양식 보완, 담당자 과제로 전환한다.', '90일 학습기록, 개선계획, 담당·기한표', 118],
])

const stageOneTopics: Topic[] = stageOneSeeds.map(item => ({
  ...item,
  stage: 1,
  guide: 'facility',
  page: guidePageByDayPlaceholder(item.day),
}))

function guidePageByDayPlaceholder(day: number) {
  const pages = [5, 14, 16, 22, 31, 36, 40, 51, 55, 58, 59, 60, 61, 65, 72, 77, 81, 89, 100, 103, 107, 130, 132, 136, 142, 145, 154, 158, 246, 256]
  return pages[day - 1] || 1
}

const topics: Topic[] = [...stageOneTopics, ...stageTwoTopics, ...stageThreeTopics]

const localGuidePdf = '/reference/2026-social-welfare-facility-guide.pdf'
const localLaborGuidePdf = '/reference/social-welfare-center-hr-labor-guide-web.pdf'
const localInspectionCasebookPdf = '/reference/2025-social-welfare-inspection-casebook.pdf'
const officialGuideDownload = 'https://www.mohw.go.kr/boardDownload.es?bid=0021&list_no=1488923&seq=1'

const sourceCards = [
  { title: '보건복지부 사회복지시설 관리안내', detail: '사회복지시설 종사자 관리, 시설운영, 지도점검의 기본 기준자료', href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000' },
  { title: '사회복지관 인사노무 길라잡이', detail: '한국사회복지관협회 노무자문 사례집을 현장 사례 해설 교재로 활용', href: localLaborGuidePdf },
  { title: '2025 사회복지법인·시설 지도점검 사례집', detail: '법인·종사자·재무회계·후원금·기능보강 지적사례와 Q&A를 실무 점검용으로 활용', href: localInspectionCasebookPdf },
  { title: '국가법령정보센터', detail: '근로기준법, 남녀고용평등법, 기간제법, 개인정보보호법 등 최신 법령 확인', href: 'https://www.law.go.kr/' },
  { title: '고용노동부 자료', detail: '개정 노동관계법, 행정해석, 정책자료, 사례 중심 교육자료 확인', href: 'https://www.moel.go.kr/' },
  { title: '직장 내 괴롭힘 예방·대응', detail: '관리자 조사 공정성, 판단기준, 예방교육 자료 확인', href: 'https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19610' },
  { title: '우리 기관 규정', detail: '운영규정, 복무규정, 인사규정, 보수규정, 서비스규정과 실제 운영 비교', href: '#' },
]

const updateCheckpoints2026 = [
  {
    title: '2026 표준 취업규칙',
    tag: '규정 대조',
    detail: '채용, 복무, 휴가, 징계, 직장 내 괴롭힘, 모성보호, 개인정보 조항을 기관 운영규정·복무규정과 대조한다.',
    action: '취업규칙 성격의 내부규정과 신구대조표 작성 필요 여부 확인',
    href: 'https://www.moel.go.kr/policy/policydata/view.do?bbs_seq=20260200740',
  },
  {
    title: '2026 최저임금',
    tag: '임금 기준',
    detail: '2026년 최저임금은 시급 10,320원, 월 환산액 2,156,880원이다. 단시간·시간제·일용성 인력과 강사비 산정 시 함께 확인한다.',
    action: '계약직·시간제·단시간 인력의 근로계약서와 지급기준 점검',
    href: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18144',
  },
  {
    title: '2026 인건비 가이드라인',
    tag: '처우 개선',
    detail: '사회복지시설 종사자 기본급 3.5% 인상, 야간수당·통상임금·유급병가·가족수당 현실화 흐름을 확인한다.',
    action: '보수규정, 급여대장, 가족수당, 병가 규정의 실제 적용 여부 확인',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488526&mid=a10413000000&nPage=1&tag=',
  },
  {
    title: '노동절 공휴일 법제화',
    tag: '복무 운영',
    detail: '공휴일에 관한 법률에 노동절이 포함되어 2026년 5월 1일부터 시행된다. 기관 운영일, 휴일근로, 대체근무 처리 기준을 확인한다.',
    action: '5월 1일 운영계획, 근무명령, 휴일근로수당 또는 대체휴무 처리 기준 점검',
    href: 'https://www.law.go.kr/',
  },
  {
    title: '노동조합법 2·3조 개정',
    tag: '위탁·용역',
    detail: '실질적으로 근로조건을 지배·결정하는 주체의 사용자성 판단이 강화되었다. 위탁·용역·하청 구조가 있는 업무에서 참고한다.',
    action: '용역·위탁계약, 시설관리, 외부인력 사용 구조가 있는 경우 노무 자문 필요 여부 확인',
    href: 'https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19047',
  },
]

const guidePageByDay: Record<number, number> = {
  1: 38,
  2: 34,
  3: 43,
  4: 48,
  5: 260,
  6: 272,
  7: 45,
  8: 45,
  9: 260,
  10: 272,
  11: 178,
  12: 178,
  13: 64,
  14: 47,
  15: 46,
  16: 47,
  17: 40,
  18: 22,
  19: 234,
  20: 64,
  21: 61,
  22: 47,
  23: 43,
  24: 61,
  25: 151,
  26: 234,
  27: 234,
  28: 260,
  29: 47,
  30: 1,
}

const laborGuidePageByDay: Record<number, number> = {
  1: 18,
  2: 14,
  3: 1,
  4: 31,
  5: 36,
  6: 44,
  7: 17,
  8: 17,
  9: 14,
  10: 49,
  11: 18,
  12: 1,
  13: 1,
  14: 1,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 1,
  20: 1,
  21: 1,
  22: 1,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 1,
  28: 1,
  29: 1,
  30: 1,
}

const facilityGuideBookmarks = [
  { label: '처음/목차', page: 1 },
  { label: '채용·종사자 관리', page: 38 },
  { label: '인력 관리·임면', page: 61 },
  { label: '교육·훈련 확인', page: 64 },
  { label: '재무회계·보조금', page: 151 },
  { label: '퇴직·사회보험', page: 178 },
  { label: '운영규정·위원회', page: 234 },
  { label: '근로시간·보수 점검', page: 260 },
  { label: '시간외근무·수당', page: 272 },
]

const laborGuideBookmarks = [
  { label: '처음/목차', page: 1 },
  { label: '채용·근로계약', page: 14 },
  { label: '퇴직적립금', page: 18 },
  { label: '경력·호봉', page: 31 },
  { label: '근로시간', page: 36 },
  { label: '시간외근무', page: 44 },
  { label: '가족수당', page: 49 },
]

const inspectionCasebookBookmarks = [
  { label: '처음/목차', page: 1 },
  { label: '법인·시설운영', page: 4 },
  { label: '종사자관리', page: 72 },
  { label: '재무·회계관리', page: 83 },
  { label: '후원금관리', page: 100 },
  { label: '기능보강사업', page: 107 },
  { label: '사회복지법인 및 시설 Q&A', page: 114 },
]

const defaultMaterial: Material = {
  source: '보건복지부 사회복지시설 관리안내 / 국가법령정보센터 / 고용노동부 자료',
  href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
  read: [
    '오늘 주제는 법령 조문을 외우는 것이 아니라, 기관에서 같은 상황이 발생했을 때 어떤 문서와 절차로 설명할 수 있는지 확인하는 방식으로 학습한다.',
    '관리자는 직원에게 구두로 안내한 내용도 업무기준, 제출기한, 후속확인으로 남길 수 있어야 하며, 실제 결재문서와 규정의 표현이 충돌하지 않는지 확인해야 한다.',
    '최신 법령 또는 지침에 따라 달라질 수 있는 사안은 이 화면의 기록만으로 확정하지 않고 공식자료와 노무사 확인을 거쳐 판단한다.',
  ],
  practice: '오늘 주제와 관련해 최근 3개월 안에 우리 기관에서 실제로 있었던 결재, 상담, 직원문의, 지도점검 자료를 하나 떠올리고 규정 근거가 남아 있는지 확인한다.',
}

const materialByArea: Record<string, Material> = {
  채용: {
    source: '보건복지부 사회복지시설 관리안내 / 국가법령정보센터 근로기준법',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '사회복지시설의 채용은 단순히 사람을 뽑는 절차가 아니라 공개성, 공정성, 기록성이 함께 확인되어야 하는 관리영역이다.',
      '채용공고, 심사기준, 면접위원 구성, 평가표, 최종결과 안내가 따로 흩어져 있으면 나중에 채용 공정성을 설명하기 어렵다.',
      '관리자는 채용 전 과정에서 개인정보 수집범위, 보관기간, 불합격자 서류 처리까지 함께 확인해야 한다.',
    ],
    practice: '최근 채용 1건을 골라 공고-심사-면접-결과공지-개인정보 처리까지 한 줄로 이어지는지 확인한다.',
  },
  인사: {
    source: '보건복지부 사회복지시설 관리안내 / 개인정보보호 관련 법령',
    href: 'https://www.law.go.kr/',
    read: [
      '인사기록은 직원의 경력, 자격, 급여, 가족관계 등 민감한 정보와 연결되므로 접근권한을 엄격히 관리해야 한다.',
      '종이문서와 전자파일의 보관위치가 다르면 실제 점검 시 누가 접근할 수 있는지 설명이 필요하다.',
      '관리자는 인사자료를 공유자료처럼 취급하지 않고, 업무상 필요한 사람만 접근하도록 기준을 세워야 한다.',
    ],
    practice: '인사기록 보관장소, 전자파일 위치, 접근 가능한 직원을 각각 적어보고 과도하게 열려 있는 자료가 있는지 확인한다.',
  },
  호봉: {
    source: '보건복지부 사회복지시설 관리안내',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '호봉은 급여와 직결되므로 경력인정 기준, 증빙자료, 산정표, 승인절차가 모두 남아 있어야 한다.',
      '경력증명서가 있다고 해서 자동으로 인정되는 것이 아니라, 기관 기준과 지침에 따라 인정범위가 검토되어야 한다.',
      '관리자는 신규입사자와 승급자의 호봉이 왜 그렇게 결정되었는지 나중에 설명할 수 있어야 한다.',
    ],
    practice: '직원 1명을 예로 들어 경력증명서와 호봉획정표가 맞는지, 승인기안이 있는지 확인한다.',
  },
  복무: {
    source: '국가법령정보센터 근로기준법 / 고용노동부 자료',
    href: 'https://www.law.go.kr/',
    read: [
      '근로시간 관리는 출근부만 보는 것이 아니라 실제 근무, 휴게, 시간외근무, 출장, 행사근무가 함께 맞아야 한다.',
      '시간외근무는 사전명령 없이 관행적으로 인정되면 급여와 복무관리 양쪽에서 문제가 생길 수 있다.',
      '관리자는 직원이 오래 남아 있었다는 사실보다 왜 남았고, 누가 명령했고, 어떤 결과가 있었는지를 확인해야 한다.',
    ],
    practice: '최근 시간외근무 1건을 골라 사전명령, 실제근무, 결과확인, 지급자료가 모두 연결되는지 본다.',
  },
  휴가: {
    source: '국가법령정보센터 근로기준법 / 고용노동부 연차휴가 설명자료',
    href: 'https://www.moel.go.kr/policy/policydata/view.do?bbs_seq=20180600335',
    read: [
      '연차와 각종 휴가는 직원 권리이면서 기관의 복무관리 책임이므로 산정, 사용, 잔여, 촉진 기록이 명확해야 한다.',
      '병가, 공가, 특별휴가는 기관 규정상 근거와 증빙 필요 여부가 다르므로 같은 방식으로 처리하면 안 된다.',
      '관리자는 직원에게 휴가 사용을 제한하는 관행이 없는지, 반대로 규정에 없는 휴가가 관행적으로 승인되는지 확인해야 한다.',
    ],
    practice: '직원 1명의 연차대장과 실제 휴가신청서를 비교해 잔여일수가 맞는지 확인한다.',
  },
  임금: {
    source: '국가법령정보센터 근로기준법 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.law.go.kr/',
    read: [
      '임금은 기본급, 수당, 시간외수당, 가족수당, 사회보험, 퇴직적립금이 모두 연결되는 영역이다.',
      '지급기준이 규정에 있어도 실제 지급자료와 다르면 점검이나 직원 민원에서 설명이 어려워진다.',
      '관리자는 수당의 지급요건, 신청자료, 승인자료, 급여대장 반영 여부를 함께 확인해야 한다.',
    ],
    practice: '가족수당 또는 시간외수당 1건을 골라 신청-승인-지급-증빙이 연결되는지 확인한다.',
  },
  퇴직: {
    source: '국가법령정보센터 근로자퇴직급여 보장법 / 고용노동부 자료',
    href: 'https://www.law.go.kr/',
    read: [
      '퇴직 관련 처리는 퇴직금 산정뿐 아니라 퇴직연금 적립, 상실신고, 연차정산, 인수인계까지 함께 확인되어야 한다.',
      '퇴사자의 미완료 업무, 계정, 자료반납이 정리되지 않으면 이후 기관 리스크로 남는다.',
      '관리자는 퇴사 처리 시 인사와 회계가 같은 기준으로 움직이도록 확인해야 한다.',
    ],
    practice: '최근 퇴사자 1명의 인수인계, 계정회수, 퇴직정산, 4대보험 상실신고가 모두 남아 있는지 확인한다.',
  },
  사회보험: {
    source: '4대보험 관계 법령 / 고용노동부 자료',
    href: 'https://www.moel.go.kr/',
    read: [
      '4대보험은 입사일, 퇴사일, 보수월액, 휴직 여부와 직접 연결되어 인사자료와 급여자료가 맞아야 한다.',
      '취득·상실신고가 늦거나 보수월액이 실제와 다르면 나중에 정산과 소명자료가 필요해진다.',
      '관리자는 월별 직원 변동이 급여대장과 보험 신고자료에 같은 방식으로 반영되었는지 확인해야 한다.',
    ],
    practice: '입퇴사자 1명을 골라 직원명부, 급여대장, 4대보험 취득·상실일을 대조한다.',
  },
  인권: {
    source: '고용노동부 직장 내 괴롭힘 예방·대응 매뉴얼',
    href: 'https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19610',
    read: [
      '직장 내 괴롭힘은 단순히 기분 나쁜 말인지가 아니라 우위성, 업무상 적정범위 초과, 신체적·정신적 고통 또는 근무환경 악화 등을 종합적으로 본다.',
      '사용자 또는 관리자가 관련된 사안은 조사 공정성이 특히 중요하며, 신고자 보호와 2차 피해 방지가 함께 필요하다.',
      '관리자는 평소 피드백을 줄 때도 사실, 기준, 업무영향, 다음 행동을 중심으로 말해야 불필요한 오해를 줄일 수 있다.',
    ],
    practice: '최근 직원 피드백 상황 1건을 떠올리고 감정표현이 아니라 사실과 기준 중심으로 기록되어 있는지 점검한다.',
  },
  교육: {
    source: '보건복지부 사회복지시설 관리안내 / 2027년 사회복지관 평가자료',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '직원교육은 이수증을 모아두는 업무가 아니라 법정교육, 보수교육, 직무교육, 평가기준을 직원별로 설명할 수 있어야 하는 영역이다.',
      '2026년 교육비 기준은 2024년, 2025년과 다르게 보아야 하므로 연도별 평가기준을 섞어 적용하지 않아야 한다.',
      '관리자는 교육계획, 교육명령, 이수증, 교육비 집행자료, 미이수 사유를 한 표에서 확인할 수 있어야 한다.',
    ],
    practice: '직원 1명을 골라 2024년, 2025년, 2026년 교육시간과 교육비 자료가 연도별 기준에 맞게 분리되어 있는지 확인한다.',
  },
  고충: {
    source: '근로자참여 및 협력증진에 관한 법률 / 고용노동부 자료',
    href: 'https://www.law.go.kr/',
    read: [
      '직원 고충은 비공식 대화로 끝낼 사안과 공식 접수·처리·회신이 필요한 사안을 구분해야 한다.',
      '고충처리 절차가 있어도 접수대장, 상담기록, 처리결과, 개선조치가 남지 않으면 실제 작동 여부를 설명하기 어렵다.',
      '관리자는 고충을 들었을 때 즉시 해결하려 하기보다 사실확인, 처리경로, 비밀보장 범위를 먼저 정리해야 한다.',
    ],
    practice: '최근 직원 불편사항 1건을 떠올리고 공식 고충으로 전환해야 할 사안인지, 단순 업무조정으로 충분한지 분류한다.',
  },
  징계: {
    source: '근로기준법 / 우리 기관 인사규정',
    href: 'https://www.law.go.kr/',
    read: [
      '징계는 관리자의 불만을 표현하는 절차가 아니라 사유, 조사, 소명, 심의, 통보가 남아야 하는 공식 절차이다.',
      '반복적인 업무실수도 바로 징계로 연결하기보다 업무지시, 피드백, 재발방지 요구, 개선기회가 기록되어 있어야 한다.',
      '관리자는 감정적 표현과 업무상 지도를 분리하고, 직원에게 요구한 행동과 기한을 문서로 남겨야 한다.',
    ],
    practice: '반복실수 사례 1건을 골라 지금까지 구두로만 이야기했는지, 업무기준과 후속확인이 기록되어 있는지 확인한다.',
  },
  계약직: {
    source: '기간제 및 단시간근로자 보호 등에 관한 법률 / 근로기준법',
    href: 'https://www.law.go.kr/',
    read: [
      '기간제 근로자는 계약기간, 업무범위, 갱신기준, 급여와 복무조건이 계약서에 명확히 반영되어야 한다.',
      '계약직이라는 이유로 교육, 복무, 고충, 안전관리에서 빠지면 차별처우 또는 관리누락으로 보일 수 있다.',
      '관리자는 계약만료 전 업무인계, 자료회수, 재계약 여부 판단 기준을 미리 정리해야 한다.',
    ],
    practice: '계약직 직원 1명의 계약서와 실제 업무분장을 비교해 업무범위가 과도하게 넓어졌는지 확인한다.',
  },
  '겸직·출장': {
    source: '우리 기관 복무규정 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '출장은 외부에 다녀왔다는 사실보다 출장명령, 목적, 결과보고, 여비정산이 하나로 연결되는지가 중요하다.',
      '외부회의와 교육은 평가자료, 네트워크 자료, 직원교육 자료로 동시에 활용될 수 있으므로 기록명을 명확히 남겨야 한다.',
      '관리자는 출장 결과가 개인 메모로 끝나지 않고 기관의 업무성과나 후속조치로 이어졌는지 확인해야 한다.',
    ],
    practice: '최근 출장 1건을 골라 출장명령서, 참석확인, 결과보고, 여비정산이 모두 같은 일정으로 맞는지 확인한다.',
  },
  평가: {
    source: '2027년 사회복지관 평가자료 / 우리 기관 평가 대시보드',
    href: '/evaluation-2027',
    read: [
      '인사노무 자료는 평가 B영역만의 문제가 아니라 시설운영, 직원권익, 교육, 안전, 개인정보 영역과 함께 연결된다.',
      '평가 준비는 서류를 모으는 일이 아니라 기준을 읽고, 우리 기관의 현재 증빙이 그 기준을 설명할 수 있는지 확인하는 과정이다.',
      '관리자는 지표별 담당자를 지정하는 것보다 미충족 사유, 보완기한, 증빙위치를 계속 갱신해야 한다.',
    ],
    practice: '평가 대시보드에서 인사노무와 연결되는 지표 1개를 열고 현재 증빙 위치와 미비사항을 기록한다.',
  },
  지도점검: {
    source: '수성구청 지도점검 준비자료 / 보건복지부 사회복지시설 관리안내',
    href: '/inspection-2026',
    read: [
      '지도점검은 서류가 있는지보다 요청받은 자료를 즉시 찾고, 수치와 기준을 설명할 수 있는지가 중요하다.',
      '인사자료는 직원명부, 임면직, 호봉, 급여, 가족수당, 4대보험, 교육자료가 서로 맞아야 한다.',
      '관리자는 점검일 전에 자료 위치, 원본 여부, 담당자 설명 가능 여부를 따로 확인해야 한다.',
    ],
    practice: '9월 18일 지도점검 기준으로 인사자료 1묶음을 골라 30초 안에 열 수 있는지 실제로 확인한다.',
  },
  관리자: {
    source: '고용노동부 직장 내 괴롭힘 예방·대응 매뉴얼 / 우리 기관 업무분장',
    href: 'https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19610',
    read: [
      '관리자의 피드백은 직원의 태도를 평가하는 말보다 사실, 기준, 영향, 다음 행동으로 정리될 때 조직에 남는다.',
      '수시보고가 반복되면 관리자의 업무시간이 무너지고 직원도 스스로 판단하는 힘을 기르기 어렵다.',
      '관리자는 결재시간, 긴급보고 기준, 재제출 기준을 명확히 안내하고 같은 방식으로 반복 적용해야 한다.',
    ],
    practice: '오늘 들어온 수시보고 1건을 골라 긴급, 결재시간 처리, 직원 자체판단 가능 중 어디에 해당하는지 분류한다.',
  },
  보안: {
    source: '개인정보보호법 / 우리 기관 개인정보 처리 기준',
    href: 'https://www.law.go.kr/',
    read: [
      '인사노무 자료는 급여, 건강, 가족관계, 징계, 고충 등 민감한 정보와 연결되므로 공유범위를 좁게 잡아야 한다.',
      '구글드라이브나 공유폴더를 사용할 때는 편의보다 접근권한, 다운로드 권한, 퇴사자 계정회수를 먼저 확인해야 한다.',
      '관리자는 파일을 만들 때부터 원본, 작업본, 제출본, 공유본을 구분해 개인정보 노출을 줄여야 한다.',
    ],
    practice: '공유폴더 1곳을 열어 퇴사자 또는 불필요한 직원이 인사노무 자료에 접근할 수 있는지 확인한다.',
  },
  인계: {
    source: '우리 기관 복무·인사규정 / 근로기준법',
    href: 'https://www.law.go.kr/',
    read: [
      '퇴사자 인수인계는 예의의 문제가 아니라 기관의 업무연속성과 자료보호를 위한 필수 절차이다.',
      '미완료 업무, 결재 중 문서, 외부기관 연락, 계정, 자료반납이 정리되지 않으면 남은 직원에게 업무부담이 전가된다.',
      '관리자는 퇴사 전 최종업무 목록과 제출기한을 구체적으로 남기고, 가능한 범위에서 완료하도록 요청해야 한다.',
    ],
    practice: '최근 또는 예정 퇴사자 1명을 기준으로 미완료 업무표와 계정회수표가 있는지 확인한다.',
  },
  예산: {
    source: '사회복지시설 회계 관련 지침 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '인건비 예산은 급여대장만 보는 것이 아니라 수당, 사회보험, 퇴직적립금, 예산변경 사유와 함께 보아야 한다.',
      '직원 변동이 있으면 인건비 잔액, 보험료, 퇴직적립금, 사업별 인력투입 증빙이 함께 흔들릴 수 있다.',
      '관리자는 예산 변경이 필요한 사안을 늦게 발견하지 않도록 월별 집행률과 인력변동을 같이 확인해야 한다.',
    ],
    practice: '최근 1개월 인건비 집행자료를 보고 예산 대비 변동 사유를 한 문장으로 설명해본다.',
  },
  서비스규정: {
    source: '우리 기관 서비스규정 / 사회복지사업법 관련 기준',
    href: 'https://www.law.go.kr/',
    read: [
      '서비스규정은 이용자 지원의 기준이지만 실제로는 직원 역할, 기록 책임, 사고 대응과도 연결된다.',
      '서비스 제공 과정에서 누가 접수하고, 누가 판단하고, 누가 기록하는지가 불명확하면 민원과 평가자료에서 설명이 어려워진다.',
      '관리자는 서비스규정의 문장과 실제 현장 흐름이 맞는지 팀별 업무분장과 함께 확인해야 한다.',
    ],
    practice: '서비스 1개를 골라 접수, 선정, 제공, 종결, 기록 책임자가 규정과 업무분장에 맞는지 확인한다.',
  },
  운영규정: {
    source: '우리 기관 운영규정 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '위원회와 의사결정은 회의록이 있다는 사실보다 규정상 필요 절차를 거쳤는지가 중요하다.',
      '운영위원회, 인사위원회, 고충처리 절차가 필요한 사안을 내부결재만으로 처리하면 절차 누락으로 보일 수 있다.',
      '관리자는 정기적으로 열린 회의와 사안 발생 시 열린 회의를 구분해 증빙을 정리해야 한다.',
    ],
    practice: '최근 위원회 1건을 골라 규정상 개최근거, 위원구성, 안건, 회의록, 결과반영이 모두 남아 있는지 본다.',
  },
  리스크: {
    source: '고용노동부 자료 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.moel.go.kr/',
    read: [
      '노무 리스크는 모든 항목을 동시에 고치는 방식보다 임금, 근로시간, 괴롭힘, 개인정보, 퇴사처리부터 우선순위를 잡아야 한다.',
      '작은 실수라도 반복되면 기관의 관리체계 부족으로 보일 수 있으므로 같은 유형의 누락을 묶어 보아야 한다.',
      '관리자는 위험요소를 발견했을 때 책임추궁보다 기준정리, 담당자 지정, 보완기한 설정으로 바꿔야 한다.',
    ],
    practice: '우리 기관 노무 리스크 3개를 적고 각각 긴급도, 영향도, 오늘 할 수 있는 조치를 표시한다.',
  },
  사례연습: {
    source: '고용노동부 직장 내 괴롭힘 예방·대응 매뉴얼 / 우리 기관 인사규정',
    href: 'https://moel.go.kr/news/enews/report/enewsView.do?news_seq=19610',
    read: [
      '직원상담은 좋은 말로 끝나는 시간이 아니라 사실확인, 기준제시, 다음 행동합의가 남아야 효과가 있다.',
      '반복적인 상담에도 변화가 없다면 상담내용, 요구사항, 재확인일을 기록해 같은 문제가 되돌아오지 않게 해야 한다.',
      '관리자는 직원의 감정은 존중하되 업무기준은 흐리지 않는 방식으로 대화해야 한다.',
    ],
    practice: '최근 직원상담 1건을 4칸으로 정리한다. 사실, 기준, 요청한 행동, 다시 확인할 날짜.',
  },
  월간정리: {
    source: '월간 학습기록 / 우리 기관 규정 전체',
    href: '/hr-labor',
    read: [
      '한 달 학습의 목적은 많이 읽었다는 기록이 아니라 실제로 바꿔야 할 규정, 양식, 회의안건을 찾는 것이다.',
      '반복해서 등장한 위험요소는 개인의 기억에 맡기지 않고 점검표, 교육자료, 결재양식으로 옮겨야 한다.',
      '관리자는 월말에 학습기록을 보고 다음 달 팀 공유 주제 1개와 규정 확인 주제 1개를 정해야 한다.',
    ],
    practice: '이번 달 기록에서 가장 많이 나온 단어 3개를 골라 다음 달 보완과제 3개로 바꾼다.',
  },
  규정: {
    source: '우리 기관 운영규정 / 보건복지부 사회복지시설 관리안내',
    href: 'https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000',
    read: [
      '운영규정은 책장에 있는 문서가 아니라 실제 결재와 직원관리의 기준이어야 한다.',
      '규정과 실제 운영이 다르면 점검에서는 규정 미비보다 더 큰 설명 부담이 생길 수 있다.',
      '관리자는 자주 쓰는 복무, 인사, 보수, 위원회, 고충처리 조항부터 실제 문서와 맞는지 확인해야 한다.',
    ],
    practice: '운영규정에서 오늘 주제와 관련된 조항을 찾아 실제 사용하는 양식이나 결재문서와 비교한다.',
  },
}

function todayDateString() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function buildChapterSections(topic: Topic, material: Material): ChapterSection[] {
  const primaryGuide = topic.stage === 1 ? '2026 사회복지시설 관리안내' : topic.stage === 2 ? '사회복지관 인사노무 길라잡이' : '2025 사회복지법인·시설 지도점검 사례집'
  return [
    {
      heading: '1. 오늘 원문 정독 범위',
      body: `오늘은 ${primaryGuide} ${topic.page}쪽부터 ${topic.area} 영역과 연결되는 부분을 읽는다. 원문을 읽을 때는 제목만 훑지 않고, “적용대상”, “기관이 해야 할 일”, “남겨야 할 증빙”, “점검에서 확인할 내용”을 표시한다. 오늘 주제는 ${topic.title}이며, 원문을 읽으면서 ${topic.keyPoint}`,
    },
    {
      heading: '2. 원문을 읽은 뒤 이해할 핵심',
      body: `${material.read.join(' ')} ${primaryGuide}를 읽을 때는 “좋은 지식”을 얻는 것보다 “우리 기관이 이 기준을 이미 지키고 있는가, 어떤 문서로 설명할 수 있는가, 부족하다면 누가 언제까지 보완해야 하는가”로 읽어야 학습효과가 생긴다.`,
    },
    {
      heading: '3. 함께 확인할 보조자료',
      body: `오늘 자료는 ${material.source}이다. ${primaryGuide}를 주교재로 읽고, 법적 판단이 필요한 부분은 국가법령정보센터와 고용노동부 자료로 확인한다. 근로시간, 휴게, 연차, 임금, 퇴직, 직장 내 괴롭힘은 한 권의 설명만으로 확정하지 않는다. 최신자료에서 변경사항이 보이면 기관 규정과 실제 결재양식이 여전히 맞는지도 같이 본다.`,
    },
    {
      heading: '4. 사회복지관 업무에 적용하기',
      body: `사회복지관의 인사노무는 일반 회사의 노무관리와 달리 보조금, 평가, 지도점검, 법인 규정, 기관 내부결재가 함께 맞아야 한다. 따라서 오늘 주제는 단순히 담당자 한 명이 아는 지식으로 끝나면 안 되고, 기관 안에서 반복적으로 쓰이는 양식과 절차로 남아야 한다. 오늘 확인할 증빙은 ${topic.evidence}이다. 이 자료가 흩어져 있거나 담당자 기억에만 의존하고 있다면 점검 시 설명이 어려워질 수 있다.`,
    },
    {
      heading: '5. 관리자로서 확인할 질문',
      body: `오늘 스스로 확인할 질문은 세 가지다. 첫째, ${topic.managerQuestion} 둘째, 이 사안을 직원에게 설명할 때 감정이나 관행이 아니라 규정과 자료로 말할 수 있는가. 셋째, 지금 우리 기관의 문서가 나중에 제3자가 보아도 같은 결론에 도달할 만큼 남아 있는가. 이 질문에 바로 답하기 어렵다면 오늘의 학습기록에 “확인 필요”로 남기고, 규정 또는 노무사 확인으로 연결하는 것이 좋다.`,
    },
    {
      heading: '6. 오늘 남길 기록',
      body: `${material.practice} 기록은 길게 쓰는 것이 목적이 아니다. 오늘 이해한 핵심 한 문장, 우리 기관에서 확인할 자료 한 가지, 궁금한 질문 한 가지, 실제 업무에 적용할 행동 한 가지를 남기면 된다. 이 기록이 1개월만 쌓여도 과장님이 팀원에게 설명할 수 있는 인사노무 언어가 생기고, 지도점검과 평가 준비에도 바로 활용할 수 있는 개인 학습자료가 된다.`,
    },
  ]
}

export default function HrLaborPage() {
  const [topicIndex, setTopicIndex] = useState(0)
  const [activeGuide, setActiveGuide] = useState<'facility' | 'labor' | 'inspection'>('facility')
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [latestRecords, setLatestRecords] = useState<LatestRecord[]>([])
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [latestDraft, setLatestDraft] = useState({
    title: '',
    source: '',
    summary: '',
    impact: '',
    question: '',
    action: '',
  })
  const [draft, setDraft] = useState({
    learned: '',
    institutionRule: '',
    workApply: '',
    question: '',
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const savedRecords: LearningRecord[] = raw ? JSON.parse(raw) : []
    setRecords(savedRecords)
    const latestRaw = localStorage.getItem(LATEST_KEY)
    if (latestRaw) setLatestRecords(JSON.parse(latestRaw))
    const progressRaw = localStorage.getItem(PROGRESS_KEY)
    if (progressRaw) {
      const saved = JSON.parse(progressRaw) as { currentDay?: number; completedDays?: number[] }
      const nextIndex = Math.min(Math.max((saved.currentDay || 1) - 1, 0), topics.length - 1)
      setTopicIndex(nextIndex)
      setCompletedDays(Array.isArray(saved.completedDays) ? saved.completedDays : [])
      setActiveGuide(topics[nextIndex].guide)
    } else {
      const legacyCompleted = topics.filter(item => savedRecords.some(record => record.topic === item.title)).map(item => item.day)
      setCompletedDays(legacyCompleted)
    }
  }, [])

  const topic = topics[topicIndex]
  const baseMaterial = materialByArea[topic.area] ?? defaultMaterial
  const material: Material = topic.stage === 1 ? baseMaterial : topic.stage === 2 ? {
    ...baseMaterial,
    source: `사회복지관 인사노무 길라잡이 p.${topic.page} / 최신 노동관계법령`,
    href: localLaborGuidePdf,
  } : {
    source: `2025 사회복지법인·시설 지도점검 사례집 p.${topic.page} / 최신 법령·지침`,
    href: localInspectionCasebookPdf,
    read: [
      topic.keyPoint,
      '사례의 지적사항, 관련 규정, 처분 또는 개선내용을 구분하여 읽고 같은 위험이 우리 기관에 있는지 확인한다.',
      '사례집은 참고자료이므로 실제 판단 전에는 2026년 관리안내와 현재 시행 중인 법령·지자체 기준을 다시 대조한다.',
    ],
    practice: `우리 기관의 ${topic.evidence} 중 하나를 열어 같은 누락이 있는지 확인하고, 발견하면 담당자와 보완기한을 기록한다.`,
  }
  const chapterSections = buildChapterSections(topic, material)
  const stageDay = ((topic.day - 1) % 30) + 1
  const guidePage = topic.guide === 'facility' ? topic.page : guidePageByDay[stageDay] || 1
  const laborGuidePage = topic.guide === 'labor' ? topic.page : laborGuidePageByDay[stageDay] || 1
  const activePdf = activeGuide === 'facility' ? localGuidePdf : activeGuide === 'labor' ? localLaborGuidePdf : localInspectionCasebookPdf
  const activePage = activeGuide === 'facility' ? guidePage : activeGuide === 'labor' ? laborGuidePage : topic.guide === 'inspection' ? topic.page : 1
  const activeTitle = activeGuide === 'facility' ? '2026 사회복지시설 관리안내' : activeGuide === 'labor' ? '사회복지관 인사노무 길라잡이' : '2025 사회복지법인·시설 지도점검 사례집'
  const activeSubtitle = activeGuide === 'facility' ? '공식 행정 기준' : activeGuide === 'labor' ? '한국사회복지관협회 노무자문 사례집' : '법인·시설 운영개선 지도점검 지적사례'
  const activePdfSrc = `${activePdf}#page=${activePage}`
  const activeBookmarks = activeGuide === 'facility' ? facilityGuideBookmarks : activeGuide === 'labor' ? laborGuideBookmarks : inspectionCasebookBookmarks
  const todayRecords = useMemo(() => records.filter(record => record.date === todayDateString()), [records])
  const todayLatestRecords = useMemo(() => latestRecords.filter(record => record.date === todayDateString()), [latestRecords])
  const progress = Math.round(completedDays.length / topics.length * 100)
  const isTopicCompleted = completedDays.includes(topic.day)
  const areaCounts = useMemo(() => {
    const counts = new Map<string, number>()
    records.forEach(record => {
      const found = topics.find(item => item.title === record.topic)
      if (found) counts.set(found.area, (counts.get(found.area) || 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [records])

  const saveRecord = () => {
    if (!draft.learned.trim() && !draft.question.trim()) return
    const record: LearningRecord = {
      id: `${Date.now()}`,
      date: todayDateString(),
      topic: topic.title,
      learned: draft.learned.trim(),
      institutionRule: draft.institutionRule.trim(),
      workApply: draft.workApply.trim(),
      question: draft.question.trim(),
    }
    const next = [record, ...records].slice(0, 300)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDraft({ learned: '', institutionRule: '', workApply: '', question: '' })
  }

  const saveProgress = (nextCompletedDays: number[], currentDay: number) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completedDays: nextCompletedDays, currentDay }))
  }

  const selectTopic = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), topics.length - 1)
    setTopicIndex(safeIndex)
    setActiveGuide(topics[safeIndex].guide)
    saveProgress(completedDays, topics[safeIndex].day)
  }

  const completeAndContinue = () => {
    const nextCompletedDays = isTopicCompleted ? completedDays : [...completedDays, topic.day].sort((a, b) => a - b)
    const nextIndex = Math.min(topicIndex + 1, topics.length - 1)
    setCompletedDays(nextCompletedDays)
    setTopicIndex(nextIndex)
    setActiveGuide(topics[nextIndex].guide)
    saveProgress(nextCompletedDays, topics[nextIndex].day)
  }

  const removeRecord = (id: string) => {
    const next = records.filter(record => record.id !== id)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const saveLatestRecord = () => {
    if (!latestDraft.title.trim() && !latestDraft.summary.trim()) return
    const record: LatestRecord = {
      id: `${Date.now()}`,
      date: todayDateString(),
      title: latestDraft.title.trim() || '최신 노무자료 확인',
      source: latestDraft.source.trim(),
      summary: latestDraft.summary.trim(),
      impact: latestDraft.impact.trim(),
      question: latestDraft.question.trim(),
      action: latestDraft.action.trim(),
    }
    const next = [record, ...latestRecords].slice(0, 200)
    setLatestRecords(next)
    localStorage.setItem(LATEST_KEY, JSON.stringify(next))
    setLatestDraft({ title: '', source: '', summary: '', impact: '', question: '', action: '' })
  }

  const removeLatestRecord = (id: string) => {
    const next = latestRecords.filter(record => record.id !== id)
    setLatestRecords(next)
    localStorage.setItem(LATEST_KEY, JSON.stringify(next))
  }

  const latestSearchPrompt = [
    '오늘 내가 공부할 사회복지시설 인사노무 학습자료를 만들어줘.',
    '보건복지부 사회복지시설 관리안내, 사회복지관 인사노무 길라잡이, 고용노동부 공식자료, 국가법령정보센터 최신 법령을 기준으로 과장인 내가 직원에게 설명할 수 있게 정리해줘.',
    '구성은 1. 오늘 공부할 주제 2. 왜 지금 중요한지 3. 원문 기준 핵심 4. 2026년 변경사항 또는 확인사항 5. 우리 기관에서 점검할 자료 6. 직원에게 설명할 쉬운 문장 7. 노무사나 부장에게 확인할 질문으로 작성해줘.',
  ].join(' ')

  const summary = [
    `[${todayDateString()} 인사노무 학습]`,
    `오늘 주제: ${topic.title}`,
    `핵심 기준: ${topic.keyPoint}`,
    `관리자 질문: ${topic.managerQuestion}`,
    `확인자료: ${topic.evidence}`,
    `오늘 읽을 자료: ${material.source}`,
    '',
    '오늘 기록',
    todayRecords.length ? todayRecords.map(record => `- ${record.topic}: ${record.learned || record.question}`).join('\n') : '- 아직 기록 없음',
    '',
    '오늘 최신 챕터 학습',
    todayLatestRecords.length ? todayLatestRecords.map(record => `- ${record.title}: ${record.summary || record.impact}${record.question ? ` / 질문: ${record.question}` : ''}`).join('\n') : '- 아직 기록 없음',
  ].join('\n')

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-950 text-white no-print">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-violet-300">HR & LABOR LEARNING</p>
            <h1 className="text-lg font-bold">인사노무 학습실</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">홈</Link>
            <button onClick={() => window.print()} className="rounded-lg bg-violet-300 px-3 py-2 font-semibold text-slate-950">출력</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-7 text-white shadow-xl">
          <p className="text-sm font-bold text-violet-200">90일 · 3단계 관리자 학습</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">세 권의 기준자료를 끝까지 읽고<br />관리자의 판단 언어로 바꾸기</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            날짜가 지나도 진도는 저절로 넘어가지 않습니다. 원문을 읽고 기관 자료를 확인한 뒤 학습 완료를 눌러야 다음 일차로 이동합니다.
          </p>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">TEXTBOOK ROADMAP</p>
            <h2 className="mt-1 text-xl font-black">90일 교재 학습 로드맵</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">각 단계를 누르면 해당 교재의 첫 미완료 학습으로 이동합니다. 학습기록은 세 단계 전체에 누적됩니다.</p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-3">
            {guideRoadmap.map(item => (
              <button
                key={item.phase}
                onClick={() => {
                  const stageTopics = topics.filter(topicItem => topicItem.stage === item.stage)
                  const target = stageTopics.find(topicItem => !completedDays.includes(topicItem.day)) || stageTopics[0]
                  selectTopic(target.day - 1)
                }}
                className={`rounded-xl border p-4 text-left transition ${topic.stage === item.stage ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:border-violet-300'}`}
              >
                <p className="text-xs font-black text-violet-700">{item.phase}</p>
                <h3 className="mt-1 text-sm font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{item.detail}</p>
                <p className="mt-3 text-xs font-black text-emerald-700">완료 {completedDays.filter(day => day > (item.stage - 1) * 30 && day <= item.stage * 30).length}/30</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-emerald-700">2026 UPDATE CHECK</p>
            <h2 className="mt-1 text-xl font-black">2025 길라잡이와 함께 볼 2026년 변경 체크포인트</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              2025년 길라잡이는 사례 해설자료로 활용하고, 실제 판단은 2026년 관리안내·표준 취업규칙·최저임금·최신 법령과 대조합니다.
            </p>
          </div>
          <div className="grid gap-3 p-5">
            {updateCheckpoints2026.map(item => (
              <article key={item.title} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[190px_1fr_1fr_auto] lg:items-center">
                <div>
                  <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{item.tag}</p>
                  <h3 className="mt-2 text-sm font-black text-slate-950">{item.title}</h3>
                </div>
                <p className="text-sm font-semibold leading-6 text-slate-700">{item.detail}</p>
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold leading-6 text-amber-900">{item.action}</p>
                <a href={item.href} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-black text-slate-700">
                  원문확인
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">현재 교재</p>
            <p className="mt-2 text-xl font-black">{topic.stage}단계</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-violet-700">현재 학습</p>
            <p className="mt-2 text-3xl font-black">{topic.day}<span className="text-base text-slate-400">/90</span></p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-emerald-700">학습 진행률</p>
            <p className="mt-2 text-3xl font-black">{progress}%</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-700">완료한 학습</p>
            <p className="mt-2 text-3xl font-black">{completedDays.length}<span className="text-base text-slate-400">개</span></p>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
          <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-violet-700">MY LEARNING STEP</p>
              <h2 className="mt-1 text-xl font-black">{topic.day}일차 · {topic.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {isTopicCompleted ? '완료한 학습입니다. 다시 읽거나 다음 일차로 이동할 수 있습니다.' : '원문과 오늘 챕터를 읽고 기록을 남긴 뒤 완료 버튼을 누르세요.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => selectTopic(topicIndex - 1)} disabled={topicIndex === 0} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">이전 학습</button>
              <button onClick={completeAndContinue} className="rounded-lg bg-violet-800 px-5 py-3 text-sm font-black text-white">
                {topic.day === 90 ? '90일 과정 완료' : isTopicCompleted ? '다음 학습으로' : '학습 완료하고 다음으로'}
              </button>
            </div>
          </div>
          <div className="h-2 bg-slate-100"><div className="h-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_420px]">
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-red-700">TODAY HR CHAPTER</p>
              <h2 className="mt-1 text-xl font-black">오늘의 최신 인사노무 챕터</h2>
              <p className="mt-1 text-sm leading-6 text-red-900">매일 최신자료 중 하나를 골라 읽고, 기본개념부터 사회복지관 적용까지 한 챕터로 학습합니다.</p>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-5">
              {['주제 선정', '자료 읽기', '개념 이해', '질문 기록', '업무 적용'].map((step, index) => (
                <div key={step} className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-black text-red-700">{index + 1}단계</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{step}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-3">
              <a href="https://www.mohw.go.kr/board.es?act=view&bid=0021&list_no=1488923&mid=a10413000000" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-300">
                <p className="text-sm font-black text-slate-900">복지부 관리안내</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">사회복지시설 인사·운영 기준 확인</p>
              </a>
              <a href="https://www.moel.go.kr/" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-300">
                <p className="text-sm font-black text-slate-900">고용노동부</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">노동관계법 개정·보도·정책자료 확인</p>
              </a>
              <a href="https://www.law.go.kr/" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-300">
                <p className="text-sm font-black text-slate-900">국가법령정보센터</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">근로기준법 등 최신 시행 법령 확인</p>
              </a>
            </div>
            <div className="border-t border-slate-100 p-5">
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-black leading-6 text-slate-800">오늘 공부자료 만들 질문 복사</p>
                  <p className="text-xs font-bold leading-5 text-slate-600">원문과 최신 변경사항을 바탕으로, 과장님이 설명할 수 있는 학습자료를 만들어 달라는 질문입니다.</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(latestSearchPrompt)} className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">질문 복사</button>
              </div>
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-900">
                목표는 매일 한 가지를 깊게 익히는 것입니다. 읽은 자료, 이해한 개념, 궁금한 질문, 우리 기관 적용점을 남기면 나중에 과장님의 인사노무 학습노트가 됩니다.
              </p>
            </div>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">CHAPTER NOTE</p>
              <h2 className="mt-1 text-xl font-black">오늘 챕터 학습기록</h2>
            </div>
            <div className="grid gap-3 p-5">
              <input value={latestDraft.title} onChange={event => setLatestDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="오늘 챕터 제목" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-red-700" />
              <input value={latestDraft.source} onChange={event => setLatestDraft(previous => ({ ...previous, source: event.target.value }))} placeholder="읽은 공식자료·링크" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-red-700" />
              <textarea value={latestDraft.summary} onChange={event => setLatestDraft(previous => ({ ...previous, summary: event.target.value }))} placeholder="오늘 읽고 이해한 내용" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-700" />
              <textarea value={latestDraft.impact} onChange={event => setLatestDraft(previous => ({ ...previous, impact: event.target.value }))} placeholder="처음 알게 된 기본개념·최신 흐름" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-700" />
              <textarea value={latestDraft.question} onChange={event => setLatestDraft(previous => ({ ...previous, question: event.target.value }))} placeholder="궁금한 점·나중에 물어볼 질문" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-700" />
              <textarea value={latestDraft.action} onChange={event => setLatestDraft(previous => ({ ...previous, action: event.target.value }))} placeholder="우리 기관 규정·업무에 적용할 내용" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-700" />
              <button onClick={saveLatestRecord} className="rounded-lg bg-red-800 px-4 py-3 text-sm font-black text-white">오늘 챕터 저장</button>
            </div>
          </aside>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_420px]">
          <article className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
            <div className="border-b border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-violet-700">TODAY LESSON</p>
              <h2 className="mt-1 text-2xl font-black">{topic.title}</h2>
              <p className="mt-2 text-sm font-bold text-violet-800">{topic.area} · {topic.day}일차</p>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-500">핵심 기준</p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{topic.keyPoint}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-700">관리자 질문</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-900">{topic.managerQuestion}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-black text-emerald-700">확인자료</p>
                <p className="mt-2 text-sm font-bold leading-6 text-emerald-900">{topic.evidence}</p>
              </div>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black text-violet-700">오늘 읽을 자료</p>
                  <a href={material.href} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-violet-800">기준자료 열기</a>
                </div>
                <p className="mt-2 text-xs font-bold text-violet-700">{material.source}</p>
                <div className="mt-3 space-y-2">
                  {material.read.map(line => (
                    <p key={line} className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-800">{line}</p>
                  ))}
                </div>
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold leading-6 text-emerald-900">적용연습: {material.practice}</p>
              </div>
            </div>
          </article>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">DAILY RECORD</p>
              <h2 className="mt-1 text-xl font-black">오늘 학습 기록</h2>
            </div>
            <div className="grid gap-3 p-5">
              <textarea value={draft.learned} onChange={event => setDraft(previous => ({ ...previous, learned: event.target.value }))} placeholder="오늘 이해한 핵심" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.institutionRule} onChange={event => setDraft(previous => ({ ...previous, institutionRule: event.target.value }))} placeholder="우리 기관 규정에서 확인할 위치" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.workApply} onChange={event => setDraft(previous => ({ ...previous, workApply: event.target.value }))} placeholder="실제 업무에 적용할 부분" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.question} onChange={event => setDraft(previous => ({ ...previous, question: event.target.value }))} placeholder="노무사·부장·규정에서 확인할 질문" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <button onClick={saveRecord} className="rounded-lg bg-violet-800 px-4 py-3 text-sm font-black text-white">학습 기록 저장</button>
            </div>
          </aside>
        </section>

        <section className="relative left-1/2 mb-5 w-screen -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-[1640px] px-6 py-6">
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-black tracking-[.18em] text-slate-500">ORIGINAL GUIDE</p>
                <h2 className="mt-1 text-xl font-black">오늘의 원문 교재 정독 모드</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  원문을 세로로 길게 읽을 수 있도록 정독창을 크게 만들었습니다. 더 크게 읽을 때는 큰 새창으로 열어 브라우저 확대를 사용합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveGuide('facility')}
                  className={`rounded-lg px-4 py-3 text-sm font-black ${activeGuide === 'facility' ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}
                >
                  관리안내
                </button>
                <button
                  onClick={() => setActiveGuide('labor')}
                  className={`rounded-lg px-4 py-3 text-sm font-black ${activeGuide === 'labor' ? 'bg-violet-800 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}
                >
                  길라잡이
                </button>
                <button
                  onClick={() => setActiveGuide('inspection')}
                  className={`rounded-lg px-4 py-3 text-sm font-black ${activeGuide === 'inspection' ? 'bg-amber-700 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}
                >
                  지도점검 사례집
                </button>
                <a href={activePdfSrc} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white">
                  큰 새창으로 읽기
                </a>
                <a href={officialGuideDownload} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800">공식 ZIP</a>
              </div>
            </div>

            <div className="mb-4">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-black text-slate-900">{activeTitle}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{activeSubtitle} · {topic.area} · {topic.title} · 오늘 시작 p.{activePage} · 화면맞춤/확대/쪽이동은 원문창 안에서 조정</p>
              </div>
            </div>

            <PdfCanvasReader fileUrl={activePdf} initialPage={activePage} scale={1.55} title={activeTitle} bookmarks={activeBookmarks} spreadView={activeGuide === 'inspection'} />
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">FULL CHAPTER</p>
            <h2 className="mt-1 text-xl font-black">오늘 챕터 전문</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">링크를 먼저 열지 않아도 오늘 분량을 읽고 학습할 수 있도록 정리한 본문입니다. 공식자료 원문은 확인용으로 함께 봅니다.</p>
          </div>
          <div className="grid gap-4 p-5">
            {chapterSections.map(section => (
              <article key={section.heading} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">{section.heading}</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">{topic.stage}단계 학습목록</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">현재 교재의 30개 주제입니다. 완료 표시는 직접 완료한 학습에만 붙습니다.</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {topics.filter(item => item.stage === topic.stage).map(item => (
                <button key={item.day} onClick={() => selectTopic(item.day - 1)} className={`rounded-xl border p-3 text-left text-sm transition ${item.day === topic.day ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:border-violet-200'}`}>
                  <p className="flex items-center justify-between gap-2 text-xs font-black text-slate-500"><span>{item.day}일차 · {item.area}</span><span className={completedDays.includes(item.day) ? 'text-emerald-700' : 'text-slate-400'}>{completedDays.includes(item.day) ? '완료' : '미완료'}</span></p>
                  <p className="mt-1 font-black text-slate-900">{item.title}</p>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">기준자료</h2>
            <div className="mt-4 space-y-3">
              {sourceCards.map(card => (
                <a key={card.title} href={card.href} target={card.href === '#' ? undefined : '_blank'} rel="noreferrer" className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-300">
                  <p className="text-sm font-black text-slate-900">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{card.detail}</p>
                </a>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-black text-red-800">주의</p>
              <p className="mt-1 text-xs leading-5 text-red-700">법적 판단이 필요한 사안은 이 화면의 학습기록만으로 확정하지 않고, 최신 법령·지침 또는 노무사 확인을 거칩니다.</p>
            </div>
          </aside>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">오늘 요약</h2>
              <button onClick={() => navigator.clipboard.writeText(summary)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white">요약 복사</button>
            </div>
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{summary}</pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">학습 분포</h2>
            <div className="mt-4 space-y-2">
              {areaCounts.length ? areaCounts.map(([area, count]) => (
                <div key={area} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex justify-between text-sm font-bold"><span>{area}</span><span>{count}건</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, count * 20)}%` }} /></div>
                </div>
              )) : <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">아직 학습기록이 없습니다.</p>}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-black">최근 학습 기록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">일자</th>
                  <th className="p-3">주제</th>
                  <th className="p-3">핵심 이해</th>
                  <th className="p-3">규정 위치</th>
                  <th className="p-3">업무 적용</th>
                  <th className="p-3">확인질문</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {records.length ? records.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 text-xs font-bold text-slate-500">{record.date}</td>
                    <td className="p-3 font-black">{record.topic}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.learned || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.institutionRule || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.workApply || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-amber-700">{record.question || '-'}</td>
                    <td className="p-3"><button onClick={() => removeRecord(record.id)} className="text-xs font-bold text-slate-400 hover:text-red-600">삭제</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">아직 기록이 없습니다. 오늘 주제를 10분만 보고 첫 기록을 남기면 됩니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-black">최근 챕터 학습기록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">일자</th>
                  <th className="p-3">챕터</th>
                  <th className="p-3">출처</th>
                  <th className="p-3">이해한 내용</th>
                  <th className="p-3">개념·흐름</th>
                  <th className="p-3">질문</th>
                  <th className="p-3">업무 적용</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {latestRecords.length ? latestRecords.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 text-xs font-bold text-slate-500">{record.date}</td>
                    <td className="p-3 font-black">{record.title}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.source || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.summary || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-red-700">{record.impact || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-amber-700">{record.question || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-emerald-700">{record.action || '-'}</td>
                    <td className="p-3"><button onClick={() => removeLatestRecord(record.id)} className="text-xs font-bold text-slate-400 hover:text-red-600">삭제</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="p-8 text-center text-sm text-slate-500">아직 챕터 기록이 없습니다. 매일 하나의 주제를 읽고 이해한 내용, 질문, 업무 적용점을 남기면 됩니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
