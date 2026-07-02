import type { ReactNode } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
}

export function ScreenContainer({ children, refreshing, onRefresh, scroll = true }: ScreenContainerProps) {
  if (!scroll) {
    return <View className="flex-1 bg-gray-50">{children}</View>;
  }
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  );
}
