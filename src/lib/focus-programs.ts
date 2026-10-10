export const focusPrograms = [
  { id: 'gosan-anolja-2026', title: '고산아놀자 축제', focus: '운영계획·현장 준비·안전', keywords: ['고산아놀자', '고산아 놀자'] },
  { id: 'bazaar-2026', title: '바자회', focus: '물품·판매 운영·정산', keywords: ['바자회'] },
  { id: 'gosan-on-2026', title: '지역밀착형 축제 고산 ON', focus: '마을 협력·참여·현장 운영', keywords: ['고산on', '고산온'] },
  { id: 'suseong-welfare-festival-2026', title: '수성복지한마당', focus: '행사 참여·운영·협력', keywords: ['수성복지한마당', '복지한마당'] },
  { id: 'volunteer-outing-2026', title: '자원봉사자 나들이', focus: '참여 인원·이동·안전', keywords: ['자원봉사자나들이', '봉사자나들이'] },
]

export const focusProgramsStorageKey = 'cheonggok-work-programs-v1'
export const focusProgramRecords = focusPrograms.map(program => ({
  id: program.id, title: program.title, team: '', owner: '', driveUrl: '', period: '',
  status: '점검필요' as const, priority: '높음' as const, risk: '', nextAction: '', memo: '',
}))
export type FocusProgramRecord = Omit<typeof focusProgramRecords[number], 'status' | 'priority'> & {
  status: '진행중' | '점검필요' | '완료' | '보류'
  priority: '높음' | '보통' | '낮음'
}

export function mergeFocusPrograms(records: FocusProgramRecord[]) {
  return focusProgramRecords.map(base => ({ ...base, ...records.find(record => record.id === base.id) }))
}
export function focusProgramHref(id: string) { return '/programs?program=' + encodeURIComponent(id) }
export function focusProgramForContent(content: string) {
  const normalized = content.replace(/\s/g, '').toLowerCase()
  return focusPrograms.find(program => program.keywords.some(keyword => normalized.includes(keyword.replace(/\s/g, '').toLowerCase())))
}

const eventDocumentStages = [
  ['계획', '행사계획·예산'], ['협력', '담당 역할·협력기관'], ['홍보·참여', '홍보·참여자 안내'],
  ['현장', '물품·공간·이동 준비'], ['안전', '안전관리·비상연락 체계'], ['정산', '지출·정산 증빙'], ['결과', '결과보고·사진·평가'],
]
export const focusProgramDocuments = focusPrograms.flatMap(program => eventDocumentStages.map(([stage, title], index) => ({
  id: program.id + '-document-' + index, programId: program.id, stage, title,
  status: '확인필요' as const, driveUrl: '', fileType: '', note: '',
})))
