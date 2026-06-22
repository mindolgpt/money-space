import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { useAuthStore } from '@/features/auth/auth-manager'
import { createEntryLocally } from '@/entities/entry'
import type { Entry } from '@/entities/entry'

type ImportedEntry = Pick<Entry, 'type' | 'amount' | 'date' | 'categoryId' | 'note'>

async function parseCSV(content: string): Promise<ImportedEntry[]> {
  const lines = content.trim().split('\n')
  const entries: ImportedEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    if (values.length >= 4) {
      entries.push({
        type: values[0] as 'income' | 'expense' | 'saving',
        amount: parseFloat(values[1]) || 0,
        date: values[2],
        categoryId: values[3] || undefined,
        note: values[4] || undefined,
      })
    }
  }

  return entries
}

async function parseJSON(content: string): Promise<ImportedEntry[]> {
  const data = JSON.parse(content)
  if (Array.isArray(data)) {
    return data.map((item) => ({
      type: item.type as 'income' | 'expense' | 'saving',
      amount: item.amount || 0,
      date: item.date || new Date().toISOString().split('T')[0],
      categoryId: item.categoryId || undefined,
      note: item.note || undefined,
    }))
  }
  return []
}

async function readFileContent(uri: string): Promise<string> {
  const response = await fetch(uri)
  return response.text()
}

export function DataImport() {
  const { user } = useAuthStore()
  const [isImporting, setIsImporting] = useState(false)

  const executeImport = async () => {
    setIsImporting(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json'],
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets?.[0]) {
        setIsImporting(false)
        return
      }

      const file = result.assets[0]
      const content = await readFileContent(file.uri)

      let entries: ImportedEntry[] = []
      if (file.name.endsWith('.json')) {
        entries = await parseJSON(content)
      } else {
        entries = await parseCSV(content)
      }

      if (entries.length === 0) {
        Alert.alert('오류', '가져올 데이터를 찾을 수 없습니다.')
        setIsImporting(false)
        return
      }

      let successCount = 0
      for (const entry of entries) {
        if (entry.amount > 0 && user?.id) {
          await createEntryLocally({
            userId: user.id,
            type: entry.type,
            amount: entry.amount,
            date: entry.date,
            categoryId: entry.categoryId,
            note: entry.note,
          })
          successCount++
        }
      }

      Alert.alert(
        '가져오기 완료',
        `${successCount}개의 항목을 가져왔습니다.`,
      )
    } catch {
      Alert.alert('오류', '가져오기 중 오류가 발생했습니다.')
    } finally {
      setIsImporting(false)
    }
  }

  const onImportPress = () => {
    Alert.alert(
      '데이터 가져오기',
      'CSV 또는 JSON 파일을 선택하여 가져올 수 있습니다.\n\n지원 형식:\n- CSV (콤마 구분, 첫 줄은 헤더)\n- JSON (배열 형식)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '파일 선택',
          onPress: executeImport,
        },
      ],
    )
  }

  return (
    <View>
      <Text className="text-base font-semibold text-text-primary mb-4">
        데이터 가져오기
      </Text>

      <View className="card p-4 mb-4">
        <Text className="text-sm text-text-secondary mb-3">
          CSV 또는 JSON 파일에서 데이터를 가져옵니다.
        </Text>

        <TouchableOpacity
          className={`py-3 rounded-xl items-center flex-row justify-center ${
            isImporting ? 'bg-accent-blue/60' : 'bg-accent-blue'
          }`}
          onPress={onImportPress}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-semibold">
            {isImporting ? '처리 중...' : '파일 선택'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}