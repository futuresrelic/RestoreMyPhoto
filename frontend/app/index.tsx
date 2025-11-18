/**
 * Home screen - Main entry point
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../state/store';
import { Button } from '../components/Button';
import { ActionCard } from '../components/ActionCard';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import axios from 'axios';

export default function HomeScreen() {
  const router = useRouter();
  const { isPremium, freeRepairsRemaining, setOriginalImage, setProcessingType } = useStore();

  // DEBUG: Show API URL when app loads
  useEffect(() => {
    const apiUrl = axios.defaults.baseURL || 'NOT SET';
    Alert.alert('DEBUG API URL', apiUrl);
  }, []);

  const pickImage = async (processingType: 'restore' | 'colorize' | 'upscale' | 'enhance') => {
    // Check free repairs limit
    if (!isPremium && freeRepairsRemaining <= 0) {
      Alert.alert(
        'Free Repairs Limit Reached',
        'You have used all your free repairs for this week. Upgrade to Premium for unlimited repairs!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Premium', onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photo library.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setOriginalImage(result.assets[0].uri);
      setProcessingType(processingType);
      router.push('/editor');
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              style={styles.logo}
            >
              <Ionicons name="sparkles" size={32} color={colors.background} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>RestoreMyPhoto</Text>
          <Text style={styles.subtitle}>AI-Powered Photo Restoration</Text>

          {!isPremium && (
            <View style={styles.freeRepairsContainer}>
              <Text style={styles.freeRepairsText}>
                Free repairs remaining: {freeRepairsRemaining}/3
              </Text>
            </View>
          )}

          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={16} color={colors.background} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Main Upload Button */}
        <View style={styles.uploadSection}>
          <Button
            title="Upload Photo"
            onPress={() => pickImage('restore')}
            size="large"
            fullWidth
            style={styles.uploadButton}
          />
          <Text style={styles.uploadHint}>
            Or choose a specific enhancement below
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Enhancement Options</Text>

          <ActionCard
            title="Restore Faces"
            description="AI-powered face restoration and enhancement"
            icon="person"
            onPress={() => pickImage('restore')}
          />

          <ActionCard
            title="Colorize Photo"
            description="Transform B&W photos to color"
            icon="color-palette"
            onPress={() => pickImage('colorize')}
          />

          <ActionCard
            title="Upscale Image"
            description="Increase resolution with AI"
            icon="expand"
            onPress={() => pickImage('upscale')}
            isPremium={!isPremium}
          />

          <ActionCard
            title="Enhance Quality"
            description="Denoise, sharpen, and color correct"
            icon="contrast"
            onPress={() => pickImage('enhance')}
          />
        </View>

        {/* Premium CTA */}
        {!isPremium && (
          <View style={styles.premiumCTA}>
            <LinearGradient
              colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <Ionicons name="diamond" size={32} color={colors.background} />
              <Text style={styles.premiumCTATitle}>Go Premium</Text>
              <Text style={styles.premiumCTAText}>
                Unlimited repairs • No watermarks • High resolution exports
              </Text>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => router.push('/paywall')}
              >
                <Text style={styles.premiumButtonText}>View Plans</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  freeRepairsContainer: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  freeRepairsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  premiumText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  uploadSection: {
    marginBottom: spacing.xl,
  },
  uploadButton: {
    marginBottom: spacing.md,
  },
  uploadHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  premiumCTA: {
    marginBottom: spacing.xl,
  },
  premiumCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  premiumCTATitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  premiumCTAText: {
    fontSize: typography.fontSize.md,
    color: colors.background,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  premiumButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  settingsText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});
