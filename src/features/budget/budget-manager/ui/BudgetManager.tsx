import { View, ScrollView, Modal } from 'react-native'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react-native'
import { colors } from '@/shared/lib/colors'
import { useBudgetManager } from '@/features/budget/budget-manager/model/use-budget-manager'
import { BudgetProgressBar } from '@/features/budget/budget-manager/ui/BudgetProgressBar'
import { Button, Input, Typography } from '@/shared/ui'

type Props = {
  visible: boolean
  onClose: () => void
}

export function BudgetManager({ visible, onClose }: Props) {
  const {
    selectedMonth,
    budgetAmounts,
    isSubmitting,
    expenseCategories,
    hasBudgets,
    onMonthChange,
    onBudgetAmountChange,
    handleSave,
    handleClearAll,
    getProgressData,
    formatMonthDisplay,
  } = useBudgetManager(visible, onClose)

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-bg-primary">
        <View className="px-4 pt-4 pb-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <Typography variant="headline-md">예산 설정</Typography>
            <Button variant="ghost" onPress={onClose}>닫기</Button>
          </View>

          <View className="flex-row items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft size={20} color={colors.accentGreen} />}
              onPress={() => onMonthChange('prev')}
            />

            <Typography variant="body-md" weight="medium" color="primary">
              {formatMonthDisplay(selectedMonth)}
            </Typography>

            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={20} color={colors.accentGreen} />}
              onPress={() => onMonthChange('next')}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-3">
          {expenseCategories.map((cat) => {
            const progress = getProgressData(cat.id)
            const amountStr = budgetAmounts[cat.id]?.toString() ?? ''

            return (
              <View key={cat.id} className="bg-bg-secondary border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <FileText size={16} color={colors.textTertiary} />
                    <Typography variant="body-md" weight="medium" color="primary" className="ml-2">{cat.name}</Typography>
                  </View>
                  {progress.budget > 0 && (
                    <Typography variant="label-sm" color="secondary">
                      {progress.budget.toLocaleString()}원 설정
                    </Typography>
                  )}
                </View>

                <View className="flex-row items-center mb-2">
                  <Input
                    variant="box"
                    keyboardType="numeric"
                    value={amountStr}
                    onChangeText={(v) => onBudgetAmountChange(cat.id, v)}
                    placeholder="예산 금액"
                    containerClassName="flex-1 mr-2 mb-0"
                  />
                  <Typography variant="label-md" color="secondary">원</Typography>
                </View>

                {progress.budget > 0 && (
                  <View className="pt-2">
                    <BudgetProgressBar
                      categoryName={cat.name}
                      spent={progress.used}
                      budget={progress.budget}
                    />
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>

        <View className="px-4 py-3 border-t border-border">
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onPress={handleClearAll}
              disabled={!hasBudgets}
            >
              초기화
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="flex-[3]"
              onPress={handleSave}
              loading={isSubmitting}
            >
              저장
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
