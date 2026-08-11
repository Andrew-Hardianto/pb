import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface NoDataProps {
  title?: string;
  description?: string;
  style?: ViewStyle;
}

const NoData: React.FC<NoDataProps> = ({ 
  title = 'Tidak ada data!', 
  description,
  style 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('@/assets/images/pb/empty.png')} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default NoData;
