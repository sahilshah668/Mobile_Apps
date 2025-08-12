import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  rightContent?: React.ReactNode;
  customIcon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showSeeAll = false,
  onSeeAllPress,
  rightContent,
  customIcon,
}) => {
  const renderTitle = () => {
    if (customIcon) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {customIcon}
        </View>
      );
    }
    return <Text style={styles.title}>{title}</Text>;
  };

  return (
    <View style={styles.container}>
      {renderTitle()}
      {showSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
          <IconSymbol name="chevron-right" size={16} color="white" />
        </TouchableOpacity>
      )}
      {rightContent && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  seeAllText: {
    fontSize: 14,
    color: 'white',
    fontFamily: theme.fonts.bold,
    fontWeight: '600',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SectionHeader; 