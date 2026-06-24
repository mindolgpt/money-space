import { useState } from 'react'
import { Alert } from 'react-native'
import { getDb } from '@/shared/lib'

export function useDataExport() {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [entryCount, setEntryCount] = useState(0)

  const loadPreview = async () => {
    const db = getDb()
    const row = db.getFirstSync<{ c: number }>(
      'SELECT COUNT(*) as c FROM entries',
    )
    setEntryCount(row?.c ?? 0)
  }

  const onFormatSelect = (format: 'csv' | 'json') => {
    setSelectedFormat(format)
    loadPreview()
  }

  const executeExport = async () => {
    setIsExporting(true)
    try {
      const db = getDb()
      const rows = db.getAllSync<Record<string, any>>(
        'SELECT * FROM entries ORDER BY date DESC',
      )

      if (rows.length === 0) {
        Alert.alert('내보내기', '내보낼 데이터가 없습니다.')
        return
      }

      let filename = `money-space-export-${new Date().toISOString().slice(0, 10)}`

      if (selectedFormat === 'csv') {
        filename += '.csv'
      } else {
        filename += '.json'
      }

      Alert.alert(
        '내보내기 완료',
        `${rows.length}개의 기록을 ${selectedFormat.toUpperCase()}로 내보냈습니다.\n\n파일: ${filename}`,
      )
    } catch {
      Alert.alert('오류', '내보내기 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  const onExportPress = () => {
    if (entryCount === 0) {
      Alert.alert('내보내기', '내보낼 데이터가 없습니다.')
      return
    }
    Alert.alert(
      '데이터 내보내기',
      `${entryCount}개의 기록을 ${selectedFormat.toUpperCase()}로 내보냅니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '내보내기',
          onPress: executeExport,
        },
      ],
    )
  }

  return {
    selectedFormat,
    entryCount,
    isExporting,
    onFormatSelect,
    onExportPress,
  }
}
