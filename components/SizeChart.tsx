import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SizeChartProps {
  visible: boolean;
  onClose: () => void;
  category: string;
}

interface SizeData {
  size: string;
  chest: string;
  waist: string;
  hips: string;
  length: string;
  shoulders: string;
}

const SizeChart: React.FC<SizeChartProps> = ({ visible, onClose, category }) => {
  const [selectedGender, setSelectedGender] = useState<'women' | 'men'>('women');

  // Size chart data for different categories
  const getSizeData = (): SizeData[] => {
    if (category.toLowerCase().includes('bag') || category.toLowerCase().includes('accessory')) {
      return [
        { size: 'Small', chest: '-', waist: '-', hips: '-', length: '25cm', shoulders: '-' },
        { size: 'Medium', chest: '-', waist: '-', hips: '-', length: '30cm', shoulders: '-' },
        { size: 'Large', chest: '-', waist: '-', hips: '-', length: '35cm', shoulders: '-' },
      ];
    }

    if (selectedGender === 'women') {
      return [
        { size: 'XS', chest: '32"', waist: '26"', hips: '36"', length: '26"', shoulders: '14"' },
        { size: 'S', chest: '34"', waist: '28"', hips: '38"', length: '26.5"', shoulders: '14.5"' },
        { size: 'M', chest: '36"', waist: '30"', hips: '40"', length: '27"', shoulders: '15"' },
        { size: 'L', chest: '38"', waist: '32"', hips: '42"', length: '27.5"', shoulders: '15.5"' },
        { size: 'XL', chest: '40"', waist: '34"', hips: '44"', length: '28"', shoulders: '16"' },
        { size: 'XXL', chest: '42"', waist: '36"', hips: '46"', length: '28.5"', shoulders: '16.5"' },
      ];
    } else {
      return [
        { size: 'XS', chest: '34"', waist: '28"', hips: '36"', length: '27"', shoulders: '16"' },
        { size: 'S', chest: '36"', waist: '30"', hips: '38"', length: '27.5"', shoulders: '16.5"' },
        { size: 'M', chest: '38"', waist: '32"', hips: '40"', length: '28"', shoulders: '17"' },
        { size: 'L', chest: '40"', waist: '34"', hips: '42"', length: '28.5"', shoulders: '17.5"' },
        { size: 'XL', chest: '42"', waist: '36"', hips: '44"', length: '29"', shoulders: '18"' },
        { size: 'XXL', chest: '44"', waist: '38"', hips: '46"', length: '29.5"', shoulders: '18.5"' },
      ];
    }
  };

  const sizeData = getSizeData();

  const renderSizeTable = () => {
    const isAccessory = category.toLowerCase().includes('bag') || category.toLowerCase().includes('accessory');
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Size</Text>
            {!isAccessory && <Text style={styles.headerCell}>Chest</Text>}
            {!isAccessory && <Text style={styles.headerCell}>Waist</Text>}
            {!isAccessory && <Text style={styles.headerCell}>Hips</Text>}
            <Text style={styles.headerCell}>Length</Text>
            {!isAccessory && <Text style={styles.headerCell}>Shoulders</Text>}
          </View>
          
          {sizeData.map((item, index) => (
            <View key={item.size} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
              <Text style={styles.sizeCell}>{item.size}</Text>
              {!isAccessory && <Text style={styles.measurementCell}>{item.chest}</Text>}
              {!isAccessory && <Text style={styles.measurementCell}>{item.waist}</Text>}
              {!isAccessory && <Text style={styles.measurementCell}>{item.hips}</Text>}
              <Text style={styles.measurementCell}>{item.length}</Text>
              {!isAccessory && <Text style={styles.measurementCell}>{item.shoulders}</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderMeasurementGuide = () => (
    <View style={styles.guideContainer}>
      <Text style={styles.guideTitle}>How to Measure</Text>
      
      <View style={styles.measurementItem}>
        <View style={styles.measurementIcon}>
          <IconSymbol name="body" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.measurementText}>
          <Text style={styles.measurementLabel}>Chest</Text>
          <Text style={styles.measurementDescription}>
            Measure around the fullest part of your chest, keeping the tape horizontal
          </Text>
        </View>
      </View>

      <View style={styles.measurementItem}>
        <View style={styles.measurementIcon}>
          <IconSymbol name="body" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.measurementText}>
          <Text style={styles.measurementLabel}>Waist</Text>
          <Text style={styles.measurementDescription}>
            Measure around your natural waistline, keeping the tape comfortably loose
          </Text>
        </View>
      </View>

      <View style={styles.measurementItem}>
        <View style={styles.measurementIcon}>
          <IconSymbol name="body" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.measurementText}>
          <Text style={styles.measurementLabel}>Hips</Text>
          <Text style={styles.measurementDescription}>
            Measure around the fullest part of your hips, keeping the tape horizontal
          </Text>
        </View>
      </View>

      <View style={styles.measurementItem}>
        <View style={styles.measurementIcon}>
          <IconSymbol name="body" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.measurementText}>
          <Text style={styles.measurementLabel}>Length</Text>
          <Text style={styles.measurementDescription}>
            Measure from shoulder to desired length for tops, or waist to desired length for bottoms
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Size Chart</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Gender Selection */}
          {!category.toLowerCase().includes('bag') && !category.toLowerCase().includes('accessory') && (
            <View style={styles.genderSelector}>
              <Text style={styles.sectionTitle}>Select Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'women' && styles.genderButtonActive
                  ]}
                  onPress={() => setSelectedGender('women')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'women' && styles.genderButtonTextActive
                  ]}>
                    Women
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'men' && styles.genderButtonActive
                  ]}
                  onPress={() => setSelectedGender('men')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'men' && styles.genderButtonTextActive
                  ]}>
                    Men
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Size Chart Table */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Size Measurements</Text>
            {renderSizeTable()}
          </View>

          {/* Measurement Guide */}
          {!category.toLowerCase().includes('bag') && !category.toLowerCase().includes('accessory') && (
            renderMeasurementGuide()
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Size Tips</Text>
            <View style={styles.tipItem}>
              <IconSymbol name="info" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                All measurements are in inches. For best fit, measure yourself while wearing light clothing.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol name="info" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                If you're between sizes, we recommend sizing up for a more comfortable fit.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol name="info" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                For bags and accessories, consider your daily carry needs when selecting size.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg + 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: theme.colors.background,
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  genderSelector: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  genderButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
  },
  genderButtonTextActive: {
    color: 'white',
  },
  chartSection: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    minWidth: 60,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  evenRow: {
    backgroundColor: '#F8F9FA',
  },
  sizeCell: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    minWidth: 60,
  },
  measurementCell: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    minWidth: 60,
  },
  guideContainer: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  measurementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  measurementText: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  measurementDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  tipsContainer: {
    paddingVertical: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.subtitle,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
    marginLeft: theme.spacing.sm,
  },
});

export default SizeChart; 