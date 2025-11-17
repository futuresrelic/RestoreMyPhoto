/**
 * Loading overlay with progress indicator
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../utils/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Processing...',
  progress = 0,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[colors.backgroundElevated, colors.backgroundLight]}
            style={styles.gradient}
          >
            <ActivityIndicator size="large" color={colors.primary} />

            <Text style={styles.message}>{message}</Text>

            {progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  message: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
