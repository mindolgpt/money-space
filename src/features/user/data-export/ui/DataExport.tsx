import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { getDb } from '@/shared/lib'

export function DataExport() {
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

      let filename = `money-space-export-${new Date().toISOString().slice(0, 10)}`

      if (selectedFormat === 'csv') {
        const headers = ['id', 'amount', 'type', 'category_id', 'note', 'date', 'payment_method', 'is_shared']
        content =
          headers.join(',') +
          '\n' +
          rows
            .map((r) =>
              headers
                .map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`)
                .join(','),
            )
            .join('\n')
        filename += '.csv'
      } else {
        filename += '.json'
      }

      if (rows.length === 0) {
        Alert.alert('내보내기', '내보낼 데이터가 없습니다.')
        return
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

  return (
    <View>
      <Text className="text-base font-semibold text-primary mb-4">
        데이터 내보내기
      </Text>

      <View className="card p-4 mb-4">
        <Text className="text-sm text-secondary mb-3">포맷 선택</Text>
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              selectedFormat === 'csv' ? 'bg-accent-blue' : 'bg-bg-tertiary'
            }`}
            onPress={() => onFormatSelect('csv')}
          >
            <Text
              className={`text-sm font-medium ${
                selectedFormat === 'csv' ? 'text-white' : 'text-secondary'
              }`}
            >
              CSV
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              selectedFormat === 'json' ? 'bg-accent-blue' : 'bg-bg-tertiary'
            }`}
            onPress={() => onFormatSelect('json')}
          >
            <Text
              className={`text-sm font-medium ${
                selectedFormat === 'json' ? 'text-white' : 'text-secondary'
              }`}
            >
              JSON
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-tertiary mb-4">
          {entryCount > 0
            ? `총 ${entryCount}개의 기록이 내보내집니다.`
            : '데이터를 불러오는 중...'}
        </Text>

        <TouchableOpacity
          className={`py-3 rounded-xl items-center flex-row justify-center ${
            isExporting ? 'bg-accent-blue/60' : 'bg-accent-blue'
          }`}
          onPress={onExportPress}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-semibold">
            {isExporting ? '내보내는 중...' : '내보내기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
