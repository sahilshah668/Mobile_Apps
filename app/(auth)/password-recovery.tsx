import theme from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const { width, height } = Dimensions.get('window');
const CODE_LENGTH = 4;

const PasswordRecoveryScreen = () => {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  const handleChange = (text: string) => {
    if (text.length <= CODE_LENGTH) {
      setCode(text);
      if (text.length === CODE_LENGTH) {
        router.push('/reset-password');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgCircleTopLeft} />
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩🏻‍🦰</Text>
          </View>
        </View>
        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>Enter 4-digits code we sent you{"\n"}on your phone number</Text>
        <Text style={styles.phone}>+98******00</Text>
        <TouchableOpacity style={styles.dotsRow} activeOpacity={1} onPress={() => inputRef.current && inputRef.current.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View key={i} style={styles.dotWrapper}>
              {code.length > i ? (
                <View style={[styles.dot, styles.dotFilled]} />
              ) : (
                <View style={[styles.dot, styles.dotEmpty]} />
              )}
            </View>
          ))}
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
        />
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.sendAgainBtn}>
            <Text style={styles.sendAgainText}>Send Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const CIRCLE_TOP_LEFT = width * 1.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'flex-start',
  },
  bgCircleTopLeft: {
    position: 'absolute',
    top: -CIRCLE_TOP_LEFT * 0.7,
    left: -CIRCLE_TOP_LEFT * 0.6,
    width: CIRCLE_TOP_LEFT,
    height: CIRCLE_TOP_LEFT,
    backgroundColor: theme.colors.primary,
    borderRadius: CIRCLE_TOP_LEFT / 2,
    zIndex: 0,
    opacity: 0.95,
  },
  content: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.09,
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarCircle: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: (width * 0.18) / 2,
    backgroundColor: theme.colors.logoBackground,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: width * 0.1,
  },
  title: {
    fontSize: theme.fontSizes.title * 0.7,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  phone: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    minHeight: width * 0.08,
  },
  dotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.09, // Increased size
    height: width * 0.09, // Increased size
    marginHorizontal: width * 0.028, // Increased spacing
  },
  dot: {
    width: width * 0.09, // Increased size
    height: width * 0.09, // Increased size
    borderRadius: (width * 0.09) / 2,
  },
  dotFilled: {
    backgroundColor: '#FF6BA3', // Pink for active
  },
  dotEmpty: {
    backgroundColor: theme.colors.logoBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.logoBackground,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  sendAgainBtn: {
    backgroundColor: '#FF6BA3',
    borderRadius: theme.borderRadius.lg,
    width: '60%', // Smaller width
    paddingVertical: theme.spacing.md, // Smaller height
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  sendAgainText: {
    color: '#fff',
    fontSize: theme.fontSizes.button,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.subtitle,
    fontSize: theme.fontSizes.link,
    fontFamily: theme.fonts.bold,
    fontWeight: 'bold',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
});

export default PasswordRecoveryScreen; 