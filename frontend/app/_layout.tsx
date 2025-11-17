/**
 * Root layout for the app
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useStore } from '../state/store';
import { colors } from '../utils/theme';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function RootLayout() {
  const initializeUser = useStore((state) => state.initializeUser);

  useEffect(() => {
    // Initialize user on app start
    initializeUser();
  }, []);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="editor"
          options={{
            title: 'Edit Photo',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="results"
          options={{
            title: 'Results',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            title: 'Go Premium',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </StripeProvider>
  );
}
