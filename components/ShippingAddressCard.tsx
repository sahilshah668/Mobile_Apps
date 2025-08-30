import theme from '@/constants/theme';
import { Address } from '@/components/AddressForm';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShippingAddressCardProps {
  address: Address;
  onEdit: () => void;
}

const ShippingAddressCard: React.FC<ShippingAddressCardProps> = ({
  address,
  onEdit,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shipping Address</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.nameText}>{address.fullName}</Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
      <Text style={styles.addressText}>{address.address}</Text>
      {address.addressLine2 && (
        <Text style={styles.addressText}>{address.addressLine2}</Text>
      )}
      <Text style={styles.cityText}>
        {address.city}, {address.state} {address.zipCode}
      </Text>
      <Text style={styles.countryText}>{address.country}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm, // Add top margin for better spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  countryText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
});

export default ShippingAddressCard; 