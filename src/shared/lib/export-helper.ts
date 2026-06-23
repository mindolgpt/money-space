import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import type { Entry } from '@/entities/entry'
import type { Category } from '@/entities/category'

type ExportData = {
  entries: Entry[]
  categories: Category[]
  year: number
  month: number
  income: number
  expense: number
  saving: number
  savingsRate: number
  dailyAvg: number
}

function getCategoryName(categories: Category[], id?: string): string {
  if (!id) return '기타'
  return categories.find((c) => c.id === id)?.name ?? '기타'
}

function getCategoryIcon(categories: Category[], id?: string): string {
  if (!id) return '📝'
  return categories.find((c) => c.id === id)?.icon ?? '📝'
}

function groupByCategory(entries: Entry[], type: 'income' | 'expense', categories: Category[] = []): { name: string; icon: string; amount: number }[] {
  const map: Record<string, number> = {}
  for (const e of entries.filter((e) => e.type === type)) {
    const key = e.categoryId || 'etc'
    map[key] = (map[key] ?? 0) + e.amount
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([catId, amount]) => ({
      name: getCategoryName(categories, catId),
      icon: getCategoryIcon(categories, catId),
      amount,
    }))
}

export async function exportToPdf(data: ExportData): Promise<void> {
  const { entries, year, month, income, expense, saving, savingsRate, dailyAvg, categories } = data

  const topExpenseCategories = groupByCategory(entries, 'expense', categories).slice(0, 5)
  const topIncomeCategories = groupByCategory(entries, 'income', categories).slice(0, 5)

  const expenseRows = topExpenseCategories
    .map((c, i) => `<tr><td>${i + 1}</td><td>${c.icon} ${c.name}</td><td style="text-align:right">${c.amount.toLocaleString()}원</td></tr>`)
    .join('')

  const incomeRows = topIncomeCategories
    .map((c, i) => `<tr><td>${i + 1}</td><td>${c.icon} ${c.name}</td><td style="text-align:right">${c.amount.toLocaleString()}원</td></tr>`)
    .join('')

  const entryRows = entries
    .slice(0, 50)
    .map((e) => {
      const typeLabel = e.type === 'income' ? '수입' : e.type === 'expense' ? '지출' : '저축'
      const catName = getCategoryName(categories, e.categoryId)
      return `<tr>
        <td>${e.date}</td>
        <td>${typeLabel}</td>
        <td style="text-align:right">${e.amount.toLocaleString()}원</td>
        <td>${catName}</td>
        <td>${e.note || '-'}</td>
      </tr>`
    })
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Money Space - ${year}년 ${month}월 보고서</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #333; }
    h1 { color: #10b981; font-size: 24px; margin-bottom: 5px; }
    h2 { color: #333; font-size: 16px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
    .summary { display: flex; gap: 15px; margin-bottom: 20px; }
    .summary-card { flex: 1; background: #f5f5f5; padding: 15px; border-radius: 10px; text-align: center; }
    .summary-card .label { font-size: 11px; color: #666; }
    .summary-card .value { font-size: 18px; font-weight: bold; margin-top: 5px; }
    .income { color: #10b981; }
    .expense { color: #ba1a1a; }
    .saving { color: #006c49; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #f0f0f0; text-align: left; padding: 8px; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; }
  </style>
</head>
<body>
  <h1>💰 Money Space</h1>
  <div class="subtitle">${year}년 ${month}월 가계부 보고서</div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">총 수입</div>
      <div class="value income">${income.toLocaleString()}원</div>
    </div>
    <div class="summary-card">
      <div class="label">총 지출</div>
      <div class="value expense">${expense.toLocaleString()}원</div>
    </div>
    <div class="summary-card">
      <div class="label">저축</div>
      <div class="value saving">${saving.toLocaleString()}원</div>
    </div>
    <div class="summary-card">
      <div class="label">절감률</div>
      <div class="value">${savingsRate}%</div>
    </div>
    <div class="summary-card">
      <div class="label">일 평균 지출</div>
      <div class="value expense">${dailyAvg.toLocaleString()}원</div>
    </div>
  </div>

  <h2>📊 지출 상위 카테고리</h2>
  <table>
    <tr><th>#</th><th>카테고리</th><th>금액</th></tr>
    ${expenseRows || '<tr><td colspan="3">데이터 없음</td></tr>'}
  </table>

  <h2>💰 수입 상위 카테고리</h2>
  <table>
    <tr><th>#</th><th>카테고리</th><th>금액</th></tr>
    ${incomeRows || '<tr><td colspan="3">데이터 없음</td></tr>'}
  </table>

  <h2>📝 최근 내역 (50건)</h2>
  <table>
    <tr><th>날짜</th><th>유형</th><th>금액</th><th>카테고리</th><th>메모</th></tr>
    ${entryRows || '<tr><td colspan="5">데이터 없음</td></tr>'}
  </table>

  <div class="footer">
    Money Space 가계부 앱으로 생성됨 | ${new Date().toLocaleDateString('ko-KR')}
  </div>
</body>
</html>
  `

  try {
    const { uri } = await Print.printToFileAsync({ html })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Money Space 보고서 공유',
      })
    } else {
      await Print.printAsync({ uri })
    }
  } catch (error) {
    console.error('PDF export error:', error)
    throw error
  }
}

export async function exportToCSV(entries: Entry[], categories: Category[], year: number, month: number): Promise<void> {
  const headers = ['날짜', '유형', '금액', '카테고리', '결제수단', '메모', '공유', '반복']
  const rows = entries.map((e) => {
    const typeLabel = e.type === 'income' ? '수입' : e.type === 'expense' ? '지출' : '저축'
    const catName = getCategoryName(categories, e.categoryId)
    return [
      e.date,
      typeLabel,
      e.amount.toString(),
      catName,
      e.paymentMethod || '',
      (e.note || '').replace(/"/g, '""'),
      e.isShared ? '예' : '아니오',
      e.isRecurring ? '예' : '아니오',
    ]
  })

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
  ].join('\n')

  const html = `<pre style="font-family: monospace; font-size: 12px;">${csv}</pre>`

  try {
    await Print.printAsync({ html })
  } catch (error) {
    console.error('CSV export error:', error)
    throw error
  }
}