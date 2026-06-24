import { View, Text } from 'react-native'
import { useDataExport } from '@/features/user/data-export/model/use-data-export'
import { Button } from '@/shared/ui'

export function DataExport() {
  const {
    selectedFormat,
    entryCount,
    isExporting,
    onFormatSelect,
    onExportPress,
  } = useDataExport()

  return (
    <View>
      <Text className="text-headline-md font-semibold text-text-primary mb-4">
        데이터 내보내기
      </Text>

      <View className="card p-4 mb-4">
        <Text className="text-label-md text-text-secondary mb-3">포맷 선택</Text>
        <View className="flex-row gap-2 mb-4">
          <Button
            variant={selectedFormat === 'csv' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onPress={() => onFormatSelect('csv')}
          >
            CSV
          </Button>
          <Button
            variant={selectedFormat === 'json' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onPress={() => onFormatSelect('json')}
          >
            JSON
          </Button>
        </View>

        <Text className="text-label-sm text-text-tertiary mb-4">
          {entryCount > 0
            ? `총 ${entryCount}개의 기록이 내보내집니다.`
            : '데이터를 불러오는 중...'}
        </Text>

        <Button
          variant="primary"
          fullWidth
          loading={isExporting}
          onPress={onExportPress}
        >
          {isExporting ? '내보내는 중...' : '내보내기'}
        </Button>
      </View>
    </View>
  )
}
