import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { setUser } from '@/store/userSlice';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const PASSWORD_LENGTH = 6;

const PasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { navigateToHome } = useAuth();

  // Simulate error for demo: if password is 6 chars and not '123456', show error
  const handleChange = async (text: string) => {
    if (text.length <= PASSWORD_LENGTH) {
      setPassword(text);
      if (text.length === PASSWORD_LENGTH) {
        setError(text !== '123456');
        if (text === '123456') {
          setIsLoading(true);
          try {
            // Simulate a brief loading state for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Set user as authenticated with mock data
            dispatch(setUser({
              name: 'Romina',
              phone: '+1234567890',
              token: 'mock-auth-token-' + Date.now(),
            }));
            
            // Navigate directly to home page
            navigateToHome();
          } catch (error) {
            console.error('Error during login:', error);
            setError(true);
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        setError(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Shape */}
      <View style={styles.bgCircleTopLeft} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩🏻‍🦰</Text>
          </View>
        </View>
        {/* Greeting */}
        <Text style={styles.greeting}>Hello, Romina!!</Text>
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {isLoading ? 'Signing you in...' : 'Type your password'}
        </Text>
        {/* Password Dots Row with Press-and-Hold Reveal */}
        <TouchableOpacity
          style={styles.dotsRow}
          activeOpacity={1}
          onPress={() => inputRef.current && inputRef.current.focus()}
          onPressIn={() => setShowPassword(true)}
          onPressOut={() => setShowPassword(false)}
          disabled={isLoading}
        >
          {Array.from({ length: PASSWORD_LENGTH }).map((_, i) => (
            <View key={i} style={styles.dotWrapper}>
              {password.length > i ? (
                showPassword ? (
                  <Text style={styles.digit}>{password[i]}</Text>
                ) : error ? (
                  <View style={[styles.dot, styles.dotError]} />
                ) : (
                  <View style={[styles.dot, styles.dotFilled]} />
                )
              ) : (
                <View style={[styles.dot, styles.dotEmpty]} />
              )}
            </View>
          ))}
        </TouchableOpacity>
        {/* Show/Hide text below dots */}
        {password.length > 0 && !isLoading && (
          <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'} password</Text>
        )}
        {/* Loading indicator */}
        {isLoading && (
          <Text style={styles.loadingText}>Welcome to Fashion Saga! 🎉</Text>
        )}
        {/* Hidden TextInput for password entry */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={password}
          onChangeText={handleChange}
          keyboardType="number-pad"
          secureTextEntry={!showPassword}
          maxLength={PASSWORD_LENGTH}
          autoFocus
          editable={!isLoading}
        />
        {/* Forgot password */}
        {error && !isLoading && (
          <TouchableOpacity onPress={() => router.push('/password-recovery')}>
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: height * 0.13,
    paddingHorizontal: theme.spacing.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarCircle: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: (width * 0.22) / 2,
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
    fontSize: width * 0.13,
  },
  greeting: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
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
  dot: {
    width: width * 0.09, // Increased size
    height: width * 0.09, // Increased size
    borderRadius: (width * 0.09) / 2,
    marginHorizontal: width * 0.018,
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
  },
  dotEmpty: {
    backgroundColor: theme.colors.logoBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.logoBackground,
  },
  dotError: {
    backgroundColor: '#FF4B4B',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  forgotText: {
    color: theme.colors.subtitle,
    fontSize: theme.fontSizes.link,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    textDecorationLine: 'underline',
  },
  dotsEyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    minHeight: width * 0.08,
  },
  eyeIconBtn: {
    marginLeft: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  dotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.09, // Increased size
    height: width * 0.09, // Increased size
    marginHorizontal: width * 0.028, // Increased spacing
  },
  digit: {
    fontSize: width * 0.09, // Increased font size
    color: theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  showText: {
    color: theme.colors.subtitle,
    fontSize: theme.fontSizes.link,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default PasswordScreen; 