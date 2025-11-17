/**
 * Paywall screen - Subscription plans
 */
import React, { useState } from 'react';
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
import { useStripe } from '@stripe/stripe-react-native';
import { useStore } from '../state/store';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';

type PlanType = 'weekly' | 'monthly' | 'yearly';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  pricePerMonth: string;
  savings?: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: '$4.99',
    pricePerMonth: '$4.99/week',
    features: [
      'Unlimited restorations',
      'No watermarks',
      'High-resolution exports',
      'All AI features',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$14.99',
    pricePerMonth: '$14.99/month',
    savings: 'Save 25%',
    popular: true,
    features: [
      'Unlimited restorations',
      'No watermarks',
      'High-resolution exports',
      'All AI features',
      'Priority support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$99.00',
    pricePerMonth: '$8.25/month',
    savings: 'Save 58%',
    features: [
      'Unlimited restorations',
      'No watermarks',
      'High-resolution exports',
      'All AI features',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [loading, setLoading] = useState(false);

  const { userId, setPremium } = useStore();

  const handleSubscribe = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not initialized');
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement Stripe payment flow
      // 1. Create payment intent on backend
      // 2. Initialize payment sheet
      // 3. Present payment sheet
      // 4. Handle payment result

      Alert.alert(
        'Demo Mode',
        'Stripe integration is ready. Add your Stripe keys to enable payments.\n\nFor demo purposes, premium will be activated.',
        [
          {
            text: 'OK',
            onPress: () => {
              setPremium(true);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    // TODO: Implement restore purchases
    Alert.alert('Restore Purchases', 'This feature will restore your previous purchases');
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.iconContainer}
          >
            <Ionicons name="diamond" size={40} color={colors.background} />
          </LinearGradient>

          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all features and remove watermarks forever
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {[
            { icon: 'infinite', text: 'Unlimited photo restorations' },
            { icon: 'water', text: 'No watermarks on exports' },
            { icon: 'resize', text: 'High-resolution exports (4K+)' },
            { icon: 'flash', text: 'Priority AI processing' },
            { icon: 'color-palette', text: 'Advanced colorization' },
            { icon: 'sparkles', text: 'All future features included' },
          ].map((feature, index) => (
            <View key={index} style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>

          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPriceDetail}>{plan.pricePerMonth}</Text>
                  </View>

                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}

                  <View style={styles.radioButton}>
                    {selectedPlan === plan.id && <View style={styles.radioButtonInner} />}
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.planFeature}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscribe Button */}
        <Button
          title={`Subscribe - ${plans.find((p) => p.id === selectedPlan)?.price}`}
          onPress={handleSubscribe}
          size="large"
          fullWidth
          loading={loading}
          style={styles.subscribeButton}
        />

        {/* Terms */}
        <Text style={styles.terms}>
          Subscription automatically renews unless auto-renew is turned off at least 24 hours
          before the end of the current period. Payment will be charged to your account at
          confirmation of purchase.
        </Text>

        {/* Restore Purchases */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
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
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  plansContainer: {
    marginBottom: spacing.xl,
  },
  plansTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    ...shadows.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  planPriceDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  planFeatures: {
    gap: spacing.sm,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planFeatureText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subscribeButton: {
    marginBottom: spacing.md,
  },
  terms: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
    marginBottom: spacing.lg,
  },
  restoreButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
