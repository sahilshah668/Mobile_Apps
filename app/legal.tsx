import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import theme from '../src/theme';
import APP_CONFIG from '../src/config/appConfig';

type LegalPage = 'privacy' | 'terms' | 'support';

export default function LegalScreen() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<LegalPage>('privacy');

  const handleBack = () => {
    router.back();
  };

  const handleExternalLink = async (url: string, title: string) => {
    if (!url) {
      Alert.alert('Not Available', `${title} is not configured for this app.`);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title} link.`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title} link.`);
    }
  };

  const handleEmailSupport = () => {
    const supportEmail = APP_CONFIG.legal?.supportEmail;
    if (!supportEmail) {
      Alert.alert('Not Available', 'Support email is not configured for this app.');
      return;
    }

    Linking.openURL(`mailto:${supportEmail}`).catch(() => {
      Alert.alert('Error', 'Failed to open email client.');
    });
  };

  const renderPrivacyPolicy = () => (
    <View style={styles.content}>
      <Text variant="heading3" style={styles.sectionTitle}>
        Privacy Policy
      </Text>
      
      {APP_CONFIG.legal?.privacyUrl ? (
        <Card variant="outlined" style={styles.linkCard}>
          <Text variant="body1" style={styles.linkText}>
            View our complete Privacy Policy online
          </Text>
          <Button
            title="View Privacy Policy"
            onPress={() => handleExternalLink(APP_CONFIG.legal!.privacyUrl!, 'Privacy Policy')}
            variant="outline"
            size="small"
          />
        </Card>
      ) : (
        <Card variant="outlined" style={styles.noContentCard}>
          <Text variant="body2" color="textSecondary">
            Privacy Policy is not configured for this app.
          </Text>
        </Card>
      )}
    </View>
  );

  const renderTermsOfService = () => (
    <View style={styles.content}>
      <Text variant="heading3" style={styles.sectionTitle}>
        Terms of Service
      </Text>
      
      {APP_CONFIG.legal?.termsUrl ? (
        <Card variant="outlined" style={styles.linkCard}>
          <Text variant="body1" style={styles.linkText}>
            View our complete Terms of Service online
          </Text>
          <Button
            title="View Terms of Service"
            onPress={() => handleExternalLink(APP_CONFIG.legal!.termsUrl!, 'Terms of Service')}
            variant="outline"
            size="small"
          />
        </Card>
      ) : (
        <Card variant="outlined" style={styles.noContentCard}>
          <Text variant="body2" color="textSecondary">
            Terms of Service is not configured for this app.
          </Text>
        </Card>
      )}
    </View>
  );

  const renderSupport = () => (
    <View style={styles.content}>
      <Text variant="heading3" style={styles.sectionTitle}>
        Support
      </Text>
      
      {APP_CONFIG.legal?.supportEmail ? (
        <Card variant="outlined" style={styles.linkCard}>
          <Text variant="body1" style={styles.linkText}>
            Need help? Contact our support team
          </Text>
          <Button
            title="Contact Support"
            onPress={handleEmailSupport}
            variant="outline"
            size="small"
          />
        </Card>
      ) : (
        <Card variant="outlined" style={styles.noContentCard}>
          <Text variant="body2" color="textSecondary">
            Support email is not configured for this app.
          </Text>
        </Card>
      )}
      
      <Card variant="outlined" style={styles.infoCard}>
        <Text variant="body2" color="textSecondary">
          App Version: {APP_CONFIG.store?.name || 'Fashion Saga'} v1.0.0
        </Text>
      </Card>
    </View>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'privacy':
        return renderPrivacyPolicy();
      case 'terms':
        return renderTermsOfService();
      case 'support':
        return renderSupport();
      default:
        return renderPrivacyPolicy();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="heading4" style={styles.headerTitle}>
          Legal & Support
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activePage === 'privacy' && styles.activeTab]}
          onPress={() => setActivePage('privacy')}
        >
          <Text
            variant="body2"
            color={activePage === 'privacy' ? 'primary' : 'textSecondary'}
            weight={activePage === 'privacy' ? 'semibold' : 'normal'}
          >
            Privacy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activePage === 'terms' && styles.activeTab]}
          onPress={() => setActivePage('terms')}
        >
          <Text
            variant="body2"
            color={activePage === 'terms' ? 'primary' : 'textSecondary'}
            weight={activePage === 'terms' ? 'semibold' : 'normal'}
          >
            Terms
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activePage === 'support' && styles.activeTab]}
          onPress={() => setActivePage('support')}
        >
          <Text
            variant="body2"
            color={activePage === 'support' ? 'primary' : 'textSecondary'}
            weight={activePage === 'support' ? 'semibold' : 'normal'}
          >
            Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  linkCard: {
    marginBottom: theme.spacing.md,
  },
  linkText: {
    marginBottom: theme.spacing.md,
  },
  noContentCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  infoCard: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
});
