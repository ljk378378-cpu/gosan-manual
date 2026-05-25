'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, Part, STATUS_LABELS } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ReportPage() {
  const [parts, setParts] = useState<Part[]>([])

  useEffect(() => {
    supabase.from('parts').select('*').order('order_num').then(({ data }) => { if (data) setParts(data) })
  }, [])

  const avgProgress = parts.length ? Math.round(parts.reduce((s, p) => s + p.progress, 0) / parts.length) : 0
  const today = format(new Date(), 'yyyy년 M월 d일 (EEE)', { locale: ko })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <Nav />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🖨️ 보고서 출력</h1>
            <p className="text-sm text-gray-500">인쇄 버튼을 누르면 PDF로 저장할 수 있습니다</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            🖨️ 인쇄 / PDF 저장
          </button>
        </div>

        {/* 보고서 본문 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8" id="report-content">
          {/* 표지 */}
          <div className="text-center border-b pb-8 mb-8">
            <div className="text-4xl mb-4">🌿</div>
            <h1 className="text-2xl font-bold text-gray-900">주민이 그린 고산 환경리빙랩 매뉴얼</h1>
            <p className="text-gray-600 mt-2">매뉴얼 제작 진행현황 보고서</p>
            <div className="mt-6 text-sm text-gray-500 space-y-1">
              <div>작성일: {today}</div>
              <div>발간 목표: 2026년 7월 15일</div>
              <div>담당부서: 청곡종합사회복지관 서비스제공팀 / 지역사회조직팀</div>
              <div>담당과장: 이진규</div>
            </div>
          </div>

          {/* 개요 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. 사업 개요</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ['사업명', '주민이 그린 고산 환경리빙랩 매뉴얼 제작'],
                  ['부제', '주민이 만든 동네 자원순환, 3년의 기록과 실천 가이드'],
                  ['규격', 'A4 · 컬러 · 50부 · 약 50페이지'],
                  ['제작 기간', '2026년 5월 ~ 7월'],
                  ['발간 목표', '2026년 7월 15일'],
                  ['참여 인원', '팀원 5명 / 주민환경연구원 40명 / 그린고산실천단 12명'],
                  ['총 예산', '약 200만원'],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="bg-gray-50 px-4 py-2 font-medium w-32">{k}</td>
                    <td className="px-4 py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 전체 진행률 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. 전체 진행현황</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-green-700">{avgProgress}%</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div className="bg-green-600 h-4 rounded-full" style={{ width: `${avgProgress}%` }} />
              </div>
            </div>
          </section>

          {/* 파트별 현황 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">3. 파트별 진행현황</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="px-3 py-2 text-left">파트</th>
                  <th className="px-3 py-2 text-center">페이지</th>
                  <th className="px-3 py-2 text-center">담당</th>
                  <th className="px-3 py-2 text-center">상태</th>
                  <th className="px-3 py-2 text-center">진행률</th>
                  <th className="px-3 py-2 text-left">비고</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-3 py-2 font-medium">{p.title}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{p.page_count}p</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{p.assignee || '-'}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{STATUS_LABELS[p.status]}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{p.progress}%</td>
                    <td className="border border-gray-200 px-3 py-2 text-xs text-gray-500">{p.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 주차별 일정 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">4. 주차별 실행 일정</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="px-3 py-2">주차</th>
                  <th className="px-3 py-2">기간</th>
                  <th className="px-3 py-2 text-left">주요 업무</th>
                  <th className="px-3 py-2">진행</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1주차', '5/19~5/23', '준비 — 목차 확정, 집필 배정, Canva 템플릿, 인쇄소 견적', '완료'],
                  ['2주차', '5/26~5/30', '원고 집필 1라운드 — 1·2부 초안 완성', '진행 중'],
                  ['3주차', '6/2~6/6', '원고 집필 2라운드 — 3·4부·에필로그·부록', '예정'],
                  ['4주차', '6/9~6/13', '원고 확정 + Canva 본작업', '예정'],
                  ['5주차', '6/16~6/20', '내부 검토 + 디자인 마무리', '예정'],
                  ['6주차', '6/23~6/27', '인쇄 발주 (300dpi PDF 전달)', '예정'],
                  ['7월', '7/1~7/15', '납품·배포 — 성과공유회 현장 배포, PDF 온라인 공개', '예정'],
                ].map(([w, d, task, status]) => (
                  <tr key={w} className={status === '완료' ? 'bg-green-50' : status === '진행 중' ? 'bg-yellow-50' : 'bg-white'}>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-center">{w}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center text-gray-500">{d}</td>
                    <td className="border border-gray-200 px-3 py-2">{task}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center font-medium">
                      {status === '완료' ? '✅ 완료' : status === '진행 중' ? '▶ 진행 중' : status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 예산 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">5. 예산 배분</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="px-3 py-2 text-left">항목</th>
                  <th className="px-3 py-2 text-center">금액</th>
                  <th className="px-3 py-2 text-left">비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Canva Pro', '20,000원', '1개월 구독'],
                  ['외부 전문가 자문비', '300,000~500,000원', '외부 리빙랩 전문가, 1회'],
                  ['인쇄·제본', '1,300,000~1,500,000원', 'A4 컬러 50p, 50부 (견적 확인 후 확정)'],
                  ['예비비', '100,000~200,000원', '수정 인쇄 등'],
                  ['합계', '약 2,000,000원', ''],
                ].map(([item, amount, note], i) => (
                  <tr key={i} className={i === 3 ? 'bg-gray-50' : 'bg-white'}>
                    <td className={`border border-gray-200 px-3 py-2 ${i === 3 ? 'font-bold' : ''}`}>{item}</td>
                    <td className={`border border-gray-200 px-3 py-2 text-center ${i === 3 ? 'font-bold' : ''}`}>{amount}</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
            청곡종합사회복지관 | 보고서 생성일: {today}
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #report-content { box-shadow: none; border: none; border-radius: 0; }
        }
      `}</style>
    </div>
  )
}
