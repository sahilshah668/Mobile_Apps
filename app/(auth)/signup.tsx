import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import theme from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Registration is disabled from mobile for now
const { width } = Dimensions.get('window');

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      {/* Decorative shapes */}
      <View style={styles.bgTop} />
      <View style={styles.bgRight} />
      <View style={styles.logoCircle}>
        <MaterialIcons name="person-add" size={width * 0.13} color={theme.colors.primary} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.text}>Registration is currently disabled on mobile. Please sign in or register on the web portal.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12 },
  title: { fontSize: 22, fontFamily: theme.fonts.bold, marginBottom: 12, color: theme.colors.text, textAlign: 'center' },
  text: { fontSize: 14, color: theme.colors.subtitle, textAlign: 'center', maxWidth: 320 },
  bgTop: { position: 'absolute', top: -140, left: -120, width: 260, height: 260, borderRadius: 130, backgroundColor: theme.colors.logoBackground },
  bgRight: { position: 'absolute', top: '40%', right: -90, width: 180, height: 180, borderRadius: 90, backgroundColor: theme.colors.primary, opacity: 0.1 },
  logoCircle: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    backgroundColor: theme.colors.logoBackground,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
});