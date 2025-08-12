import theme from '@/constants/theme';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.bgCircleTopLeft} />
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩🏻‍🦰</Text>
          </View>
        </View>
        <Text style={styles.title}>Setup New Password</Text>
        <Text style={styles.subtitle}>Please, setup a new password for{"\n"}your account</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={theme.colors.subtitle}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Repeat Password"
          placeholderTextColor={theme.colors.subtitle}
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
        />
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.logoBackground,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    width: '80%',
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  saveText: {
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
    fontFamily: theme.fonts.regular,
  },
});

export default ResetPasswordScreen; 