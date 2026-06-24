import { View, Text } from 'react-native'
import { useDataImport } from '@/features/user/data-import/model/use-data-import'
import { Button } from '@/shared/ui'

export function DataImport() {
  const { isImporting, onImportPress } = useDataImport()

  return (
    <View>
      <Text className="text-headline-md font-semibold text-text-primary mb-4">
        데이터 가져오기
      </Text>

      <View className="card p-4 mb-4">
        <Text className="text-body-md text-text-secondary mb-3">
          CSV 또는 JSON 파일에서 데이터를 가져옵니다.
        </Text>

        <Button
          variant="primary"
          fullWidth
          loading={isImporting}
          onPress={onImportPress}
        >
          {isImporting ? '처리 중...' : '파일 선택'}
        </Button>
      </View>
    </View>
  )
}
