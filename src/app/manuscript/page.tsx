import { readFileSync } from 'fs'
import { join } from 'path'
import ManuscriptViewer from './ManuscriptViewer'

export const dynamic = 'force-dynamic'

export default function ManuscriptPage() {
  const filePath = join(process.cwd(), '주민이그린고산_전체원고_합본작업본.md')
  const content = readFileSync(filePath, 'utf-8')

  return <ManuscriptViewer content={content} />
}
