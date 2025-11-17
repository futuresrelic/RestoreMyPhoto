/**
 * Zustand state management store
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSubscription, SubscriptionData } from '../utils/api';

// Types
export interface ImageState {
  originalImage: string | null;
  processedImage: string | null;
  imageId: string | null;
  processingType: 'restore' | 'colorize' | 'upscale' | 'enhance' | null;
  hasWatermark: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export interface UserState {
  userId: string | null;
  isPremium: boolean;
  subscription: SubscriptionData | null;
  freeRepairsRemaining: number;
}

export interface AppState extends ImageState, ProcessingState, UserState {
  // Image actions
  setOriginalImage: (uri: string) => void;
  setProcessedImage: (uri: string, imageId: string, hasWatermark: boolean) => void;
  setProcessingType: (type: ImageState['processingType']) => void;
  clearImages: () => void;

  // Processing actions
  setProcessing: (isProcessing: boolean, progress?: number) => void;
  setError: (error: string | null) => void;

  // User actions
  initializeUser: () => Promise<void>;
  setUserId: (userId: string) => void;
  setPremium: (isPremium: boolean) => void;
  loadSubscription: () => Promise<void>;
  updateFreeRepairs: () => void;

  // App actions
  reset: () => void;
}

// Initial state
const initialState = {
  // Image state
  originalImage: null,
  processedImage: null,
  imageId: null,
  processingType: null,
  hasWatermark: false,

  // Processing state
  isProcessing: false,
  progress: 0,
  error: null,

  // User state
  userId: null,
  isPremium: false,
  subscription: null,
  freeRepairsRemaining: 3,
};

// Create store
export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  // Image actions
  setOriginalImage: (uri: string) => {
    set({ originalImage: uri, processedImage: null, imageId: null, hasWatermark: false });
  },

  setProcessedImage: (uri: string, imageId: string, hasWatermark: boolean) => {
    set({ processedImage: uri, imageId, hasWatermark });
  },

  setProcessingType: (type: ImageState['processingType']) => {
    set({ processingType: type });
  },

  clearImages: () => {
    set({
      originalImage: null,
      processedImage: null,
      imageId: null,
      processingType: null,
      hasWatermark: false,
      error: null,
    });
  },

  // Processing actions
  setProcessing: (isProcessing: boolean, progress: number = 0) => {
    set({ isProcessing, progress, error: null });
  },

  setError: (error: string | null) => {
    set({ error, isProcessing: false });
  },

  // User actions
  initializeUser: async () => {
    try {
      // Try to load existing user ID
      let userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        // Generate new user ID
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('userId', userId);
      }

      set({ userId });

      // Load subscription data
      await get().loadSubscription();
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  },

  setUserId: (userId: string) => {
    set({ userId });
    AsyncStorage.setItem('userId', userId);
  },

  setPremium: (isPremium: boolean) => {
    set({ isPremium });
  },

  loadSubscription: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const subscription = await getSubscription(userId);
      const isPremium = subscription.is_active && subscription.subscription_tier !== 'free';
      const freeRepairsRemaining = subscription.free_repairs_limit - subscription.free_repairs_used;

      set({
        subscription,
        isPremium,
        freeRepairsRemaining,
      });
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  },

  updateFreeRepairs: () => {
    const { subscription } = get();
    if (!subscription) return;

    const freeRepairsRemaining = subscription.free_repairs_limit - subscription.free_repairs_used;
    set({ freeRepairsRemaining });
  },

  // App actions
  reset: () => {
    set(initialState);
  },
}));

// Selectors (for optimized re-renders)
export const selectImageState = (state: AppState): ImageState => ({
  originalImage: state.originalImage,
  processedImage: state.processedImage,
  imageId: state.imageId,
  processingType: state.processingType,
  hasWatermark: state.hasWatermark,
});

export const selectProcessingState = (state: AppState): ProcessingState => ({
  isProcessing: state.isProcessing,
  progress: state.progress,
  error: state.error,
});

export const selectUserState = (state: AppState): UserState => ({
  userId: state.userId,
  isPremium: state.isPremium,
  subscription: state.subscription,
  freeRepairsRemaining: state.freeRepairsRemaining,
});

export default useStore;
