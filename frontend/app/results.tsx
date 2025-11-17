/**
 * Results screen - Show before/after comparison
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/store';
import { Button } from '../components/Button';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { colors, spacing, typography, borderRadius } from '../utils/theme';

export default function ResultsScreen() {
  const router = useRouter();

  const {
    originalImage,
    processedImage,
    hasWatermark,
    isPremium,
    clearImages,
  } = useStore();

  if (!originalImage || !processedImage) {
    router.back();
    return null;
  }

  const handleDownload = async () => {
    try {
      // Download the image
      const filename = `restored_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.downloadAsync(processedImage, localUri);

      // Share or save
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save restored photo',
        });
      } else {
        Alert.alert('Success', 'Photo saved to device');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download photo');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my restored photo from RestoreMyPhoto!',
        url: processedImage,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleRemoveWatermark = () => {
    if (!isPremium) {
      Alert.alert(
        'Remove Watermark',
        'Remove the watermark for $1.49 or upgrade to Premium for unlimited watermark-free exports!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay $1.49',
            onPress: () => {
              // TODO: Implement one-time payment
              Alert.alert('Coming Soon', 'One-time payment will be implemented with Stripe');
            },
          },
          {
            text: 'Go Premium',
            onPress: () => router.push('/paywall'),
          },
        ]
      );
    }
  };

  const handleNewPhoto = () => {
    clearImages();
    router.back();
    router.back();
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Before/After Slider */}
        <View style={styles.sliderContainer}>
          <BeforeAfterSlider beforeImage={originalImage} afterImage={processedImage} />
        </View>

        {/* Watermark Notice */}
        {hasWatermark && (
          <View style={styles.watermarkNotice}>
            <Ionicons name="water" size={20} color={colors.warning} />
            <Text style={styles.watermarkText}>
              This photo includes a watermark. Upgrade to Premium or pay $1.49 to remove it.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Download Photo"
            onPress={handleDownload}
            size="large"
            fullWidth
            style={styles.actionButton}
          />

          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            size="large"
            fullWidth
            style={styles.actionButton}
          />

          {hasWatermark && (
            <Button
              title="Remove Watermark"
              onPress={handleRemoveWatermark}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.actionButton}
            />
          )}
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
              <Ionicons name="diamond" size={28} color={colors.background} />
              <Text style={styles.premiumTitle}>Unlock Premium</Text>
              <Text style={styles.premiumText}>
                • Unlimited restorations{'\n'}
                • No watermarks{'\n'}
                • High-resolution exports{'\n'}
                • Priority processing
              </Text>
              <Button
                title="View Plans"
                onPress={() => router.push('/paywall')}
                variant="secondary"
                size="medium"
                style={styles.premiumButton}
              />
            </LinearGradient>
          </View>
        )}

        {/* New Photo Button */}
        <Button
          title="Restore Another Photo"
          onPress={handleNewPhoto}
          variant="ghost"
          size="medium"
          fullWidth
        />
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
  sliderContainer: {
    marginBottom: spacing.xl,
  },
  watermarkNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  watermarkText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  actionButton: {
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
  premiumTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  premiumText: {
    fontSize: typography.fontSize.md,
    color: colors.background,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  premiumButton: {
    backgroundColor: colors.background,
  },
});
