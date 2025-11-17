/**
 * Editor screen - Process and edit photos
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../state/store';
import { Button } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import {
  restoreImage,
  colorizeImage,
  upscaleImage,
  enhanceImage,
} from '../utils/api';

export default function EditorScreen() {
  const router = useRouter();
  const [upscaleFactor, setUpscaleFactor] = useState(2);

  const {
    originalImage,
    processingType,
    isProcessing,
    setProcessing,
    setError,
    setProcessedImage,
    userId,
    isPremium,
    loadSubscription,
  } = useStore();

  if (!originalImage || !processingType) {
    router.back();
    return null;
  }

  const processImage = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not initialized');
      return;
    }

    try {
      setProcessing(true, 0);

      let result;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessing(true, Math.min(90, Math.random() * 100));
      }, 500);

      // Call appropriate API based on processing type
      switch (processingType) {
        case 'restore':
          result = await restoreImage(originalImage, userId, isPremium, upscaleFactor);
          break;
        case 'colorize':
          result = await colorizeImage(originalImage, userId, isPremium);
          break;
        case 'upscale':
          result = await upscaleImage(originalImage, userId, isPremium, upscaleFactor);
          break;
        case 'enhance':
          result = await enhanceImage(originalImage, userId, isPremium);
          break;
        default:
          throw new Error('Invalid processing type');
      }

      clearInterval(progressInterval);

      if (result.success && result.processed_image_url) {
        setProcessedImage(
          result.processed_image_url,
          result.image_id,
          result.has_watermark
        );

        // Reload subscription to update free repairs count
        await loadSubscription();

        // Navigate to results
        router.push('/results');
      } else {
        throw new Error(result.message || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      setError(error.message || 'Failed to process image');
      Alert.alert('Error', error.message || 'Failed to process image');
    } finally {
      setProcessing(false, 0);
    }
  };

  const getTitle = () => {
    switch (processingType) {
      case 'restore':
        return 'Restore Faces';
      case 'colorize':
        return 'Colorize Photo';
      case 'upscale':
        return 'Upscale Image';
      case 'enhance':
        return 'Enhance Quality';
      default:
        return 'Edit Photo';
    }
  };

  const getDescription = () => {
    switch (processingType) {
      case 'restore':
        return 'AI will restore and enhance faces in your photo';
      case 'colorize':
        return 'AI will add natural colors to your photo';
      case 'upscale':
        return 'AI will increase the resolution of your photo';
      case 'enhance':
        return 'AI will denoise, sharpen, and color correct your photo';
      default:
        return '';
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <Image source={{ uri: originalImage }} style={styles.preview} resizeMode="contain" />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>
        </View>

        {/* Options */}
        {(processingType === 'restore' || processingType === 'upscale') && (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionLabel}>Upscale Factor</Text>
            <View style={styles.upscaleButtons}>
              {[1, 2, 3, 4].map((factor) => (
                <Button
                  key={factor}
                  title={`${factor}x`}
                  onPress={() => setUpscaleFactor(factor)}
                  variant={upscaleFactor === factor ? 'primary' : 'outline'}
                  size="small"
                  style={styles.upscaleButton}
                />
              ))}
            </View>
          </View>
        )}

        {/* Process Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Process Photo"
            onPress={processImage}
            size="large"
            fullWidth
            loading={isProcessing}
          />

          {!isPremium && (
            <Text style={styles.watermarkNotice}>
              Free version includes watermark and limited resolution
            </Text>
          )}
        </View>
      </ScrollView>

      <LoadingOverlay
        visible={isProcessing}
        message={`Processing ${getTitle()}...`}
        progress={useStore((state) => state.progress)}
      />
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
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    marginBottom: spacing.xl,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  optionsContainer: {
    marginBottom: spacing.xl,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  upscaleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  upscaleButton: {
    flex: 1,
  },
  actionContainer: {
    marginBottom: spacing.xl,
  },
  watermarkNotice: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
