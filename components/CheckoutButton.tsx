import theme from '@/constants/theme';
import { getShadowStyle, getBorderRadius, getSpacing } from '@/constants/themeUtils';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CheckoutButtonProps {
  total: number;
  onCheckout: () => void;
  disabled?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  total,
  onCheckout,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          ${total.toFixed(2).replace('.', ',')}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.checkoutButton, disabled && styles.disabledButton]}
        onPress={onCheckout}
        disabled={disabled}
      >
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginRight: theme.spacing.sm,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
  },
  checkoutText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default CheckoutButton; 