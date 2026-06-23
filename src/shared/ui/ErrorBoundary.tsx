import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { AlertTriangle } from 'lucide-react-native'
import { logger } from '@/shared/lib/logger'
import { colors } from '@/shared/lib/colors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View className="flex-1 justify-center items-center p-6 bg-bg-primary">
          <View className="w-16 h-16 rounded-2xl bg-accent-orange/15 items-center justify-center mb-4">
            <AlertTriangle size={32} color={colors.accentOrange} />
          </View>
          <Text className="text-xl font-bold text-text-primary mb-2 tracking-tight">문제가 발생했습니다</Text>
          <Text className="text-sm text-text-secondary text-center mb-4 leading-5">
            예상치 못한 오류가 발생했습니다.
          </Text>
          {this.state.error?.message ? (
            <Text className="text-xs text-text-tertiary text-center mb-6 font-mono">
              {this.state.error.message}
            </Text>
          ) : null}
          <TouchableOpacity
            className="px-8 py-3.5 bg-accent-green rounded-lg"
            onPress={this.handleRetry}
          >
            <Text className="text-white font-semibold text-base">다시 시도</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}
