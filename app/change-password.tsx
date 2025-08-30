import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '@/constants/theme';
import { RootState } from '@/store/store';
import { changeUserPassword, clearProfileError } from '@/store/userSlice';
import { IconSymbol } from '@/components/ui/IconSymbol';

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profileLoading, profileError } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(changeUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })).unwrap();
      
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (length >= 8) score++;

    if (score <= 2) return { strength: 'Weak', color: '#FF6B6B' };
    if (score <= 3) return { strength: 'Fair', color: '#FFA726' };
    if (score <= 4) return { strength: 'Good', color: '#66BB6A' };
    return { strength: 'Strong', color: '#4CAF50' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Icon */}
        <View style={styles.securityIconContainer}>
          <View style={styles.securityIcon}>
            <IconSymbol name="lock" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.securityTitle}>Update Your Password</Text>
          <Text style={styles.securitySubtitle}>
            Choose a strong password to keep your account secure
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.currentPassword && styles.inputError]}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                placeholder="Enter your current password"
                placeholderTextColor={theme.colors.subtitle}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <IconSymbol
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.newPassword && styles.inputError]}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                placeholder="Enter your new password"
                placeholderTextColor={theme.colors.subtitle}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <IconSymbol
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>
            {formData.newPassword && (
              <View style={styles.passwordStrengthContainer}>
                <Text style={styles.passwordStrengthLabel}>Password strength:</Text>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.strength}
                </Text>
              </View>
            )}
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your new password"
                placeholderTextColor={theme.colors.subtitle}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IconSymbol
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Password Requirements</Text>
          <View style={styles.requirementItem}>
            <IconSymbol 
              name={formData.newPassword.length >= 8 ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={formData.newPassword.length >= 8 ? '#4CAF50' : '#FF6B6B'} 
            />
            <Text style={styles.requirementText}>At least 8 characters long</Text>
          </View>
          <View style={styles.requirementItem}>
            <IconSymbol 
              name={/[a-z]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={/[a-z]/.test(formData.newPassword) ? '#4CAF50' : '#FF6B6B'} 
            />
            <Text style={styles.requirementText}>Contains lowercase letter</Text>
          </View>
          <View style={styles.requirementItem}>
            <IconSymbol 
              name={/[A-Z]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={/[A-Z]/.test(formData.newPassword) ? '#4CAF50' : '#FF6B6B'} 
            />
            <Text style={styles.requirementText}>Contains uppercase letter</Text>
          </View>
          <View style={styles.requirementItem}>
            <IconSymbol 
              name={/\d/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={/\d/.test(formData.newPassword) ? '#4CAF50' : '#FF6B6B'} 
            />
            <Text style={styles.requirementText}>Contains number</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.changeButton} 
            onPress={handleChangePassword}
            disabled={profileLoading}
          >
            <LinearGradient
              colors={[theme.colors.primary, '#0056CC']}
              style={styles.changeButtonGradient}
            >
              {profileLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.changeButtonText}>Change Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  securityIconContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  securityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  securitySubtitle: {
    fontSize: 14,
    color: theme.colors.subtitle,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  eyeButton: {
    padding: theme.spacing.md,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: theme.colors.subtitle,
    marginRight: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  requirementsSection: {
    backgroundColor: 'rgba(21, 107, 255, 0.05)',
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  requirementText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  changeButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  changeButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default ChangePasswordScreen;
