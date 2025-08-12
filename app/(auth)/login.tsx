import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { loginUser } from '@/store/userSlice';
import theme from '@/constants/theme';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      const res: any = await dispatch(loginUser({ email, password }) as any);
      if (res?.error) throw new Error(res.error.message || 'Login failed');
      router.replace('/');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      {/* Background shapes */}
      <View style={styles.bgCircleTopLeft} />
      <View style={styles.bgCircleRight} />
      <KeyboardAwareScrollView contentContainerStyle={styles.scroll}
        enableOnAndroid extraScrollHeight={24} keyboardShouldPersistTaps="handled">
        {/* Brand mark */}
        <View style={styles.logoCircle}>
          <MaterialIcons name="shopping-bag" size={width * 0.13} color={theme.colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSubtitle}>Sign in to continue shopping</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.formCard}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.subtitle}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.subtitle}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabled]} onPress={onSubmit} disabled={loading}>
            <LinearGradient colors={[theme.colors.primary, '#0056CC']} style={styles.primaryBtnGradient}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/password-recovery')}>
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="mail" size={18} color={theme.colors.text} />
              <Text style={styles.socialText}>Email OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="phone-android" size={18} color={theme.colors.text} />
              <Text style={styles.socialText}>Phone OTP</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}
            style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Create an account</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.guestAction}>
          <Text style={styles.guestText}>Browse as Guest</Text>
        </TouchableOpacity>
        <Text style={styles.legalText}>By continuing, you agree to our Terms and Privacy Policy</Text>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const CIRCLE_L = width * 1.4;
const CIRCLE_R = width * 0.9;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bgCircleTopLeft: {
    position: 'absolute', top: -CIRCLE_L * 0.6, left: -CIRCLE_L * 0.6,
    width: CIRCLE_L, height: CIRCLE_L, borderRadius: CIRCLE_L / 2,
    backgroundColor: theme.colors.logoBackground, zIndex: 0,
  },
  bgCircleRight: {
    position: 'absolute', top: height * 0.25, right: -CIRCLE_R * 0.4,
    width: CIRCLE_R, height: CIRCLE_R, borderRadius: CIRCLE_R / 2,
    backgroundColor: theme.colors.primary, opacity: 0.12, zIndex: 0,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerTitle: {
    fontSize: 28, fontFamily: theme.fonts.bold, color: theme.colors.text,
    marginBottom: 16,
  },
  headerSubtitle: { color: theme.colors.subtitle, marginTop: -8, marginBottom: 16 },
  errorText: { color: 'crimson', marginBottom: 8 },
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
  formCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
  },
  input: {
    backgroundColor: theme.colors.logoBackground, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, color: theme.colors.text,
    marginBottom: 12,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 10 },
  primaryBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  primaryBtnGradient: { padding: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontFamily: theme.fonts.bold },
  disabled: { opacity: 0.7 },
  secondaryBtn: { alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { color: theme.colors.link },
  forgotText: { color: theme.colors.link, textAlign: 'center', marginTop: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { color: theme.colors.subtitle, fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  socialBtn: { flex: 1, backgroundColor: theme.colors.logoBackground, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  socialText: { color: theme.colors.text, fontFamily: theme.fonts.bold },
  guestAction: { alignItems: 'center', marginTop: 18 },
  guestText: { color: theme.colors.link },
  legalText: { color: theme.colors.subtitle, textAlign: 'center', fontSize: 12, marginTop: 8 },
});