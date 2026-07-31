import { Colors, ThemeColor } from '@/constants/theme';
import { useAppStore } from '@/stores/appStore';
import { useMemo } from 'react';

export function useTheme() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const colors = useMemo(() => {
    return isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  }, [isDarkMode]);

  return { isDarkMode, colors };
}
