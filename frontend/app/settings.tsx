/**
 * Settings screen
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/store';
import { colors, spacing, typography, borderRadius } from '../utils/theme';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  destructive = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <Ionicons
            name={icon}
            size={24}
            color={destructive ? colors.error : colors.primary}
          />
        </View>

        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>

        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();

  const {
    userId,
    isPremium,
    subscription,
    freeRepairsRemaining,
    reset,
  } = useStore();

  const handleManageSubscription = () => {
    if (isPremium) {
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, please visit your App Store settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open app settings
              Linking.openSettings();
            },
          },
        ]
      );
    } else {
      router.push('/paywall');
    }
  };

  const handleRestorePurchases = () => {
    // TODO: Implement restore purchases
    Alert.alert('Restore Purchases', 'Checking for previous purchases...');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@restoremyphoto.com?subject=Support Request');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://restoremyphoto.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://restoremyphoto.com/terms');
  };

  const handleRateApp = () => {
    // TODO: Implement rate app
    Alert.alert('Rate App', 'Thank you for considering rating our app!');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all your data and reset the app. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            reset();
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.accountCard}>
            <LinearGradient
              colors={[colors.backgroundElevated, colors.backgroundLight]}
              style={styles.accountGradient}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountIconContainer}>
                  <Ionicons
                    name={isPremium ? 'diamond' : 'person'}
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountStatus}>
                    {isPremium ? 'Premium Member' : 'Free Account'}
                  </Text>
                  <Text style={styles.accountId}>ID: {userId?.slice(0, 12)}...</Text>
                </View>
              </View>

              {!isPremium && (
                <View style={styles.freeRepairsInfo}>
                  <Text style={styles.freeRepairsText}>
                    Free repairs remaining: {freeRepairsRemaining}/3
                  </Text>
                  <Text style={styles.freeRepairsHint}>Resets weekly</Text>
                </View>
              )}

              {subscription && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionTier}>
                    Plan: {subscription.subscription_tier.toUpperCase()}
                  </Text>
                  <Text style={styles.subscriptionStatus}>
                    Status: {subscription.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <SettingItem
            icon={isPremium ? 'diamond' : 'arrow-up-circle'}
            title={isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            subtitle={isPremium ? 'View and manage your plan' : 'Unlimited repairs, no watermarks'}
            onPress={handleManageSubscription}
          />

          <SettingItem
            icon="refresh"
            title="Restore Purchases"
            subtitle="Restore your previous purchases"
            onPress={handleRestorePurchases}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Get help with your account"
            onPress={handleContactSupport}
          />

          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Love the app? Leave us a review"
            onPress={handleRateApp}
          />
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <SettingItem
            icon="shield-checkmark"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />

          <SettingItem
            icon="document-text"
            title="Terms of Service"
            onPress={handleTermsOfService}
          />
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <SettingItem
            icon="trash"
            title="Clear All Data"
            subtitle="Reset app and clear cache"
            onPress={handleClearData}
            destructive
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>RestoreMyPhoto v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with AI ❤️</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  accountCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  accountGradient: {
    padding: spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountStatus: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accountId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  freeRepairsInfo: {
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  freeRepairsText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  freeRepairsHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  subscriptionInfo: {
    marginTop: spacing.md,
  },
  subscriptionTier: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subscriptionStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  destructiveText: {
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  appInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});
