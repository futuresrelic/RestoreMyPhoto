/**
 * API utilities for communicating with the backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';

// API Configuration
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface ProcessImageResponse {
  success: boolean;
  message: string;
  processed_image_url?: string;
  has_watermark: boolean;
  processing_time: number;
  image_id: string;
}

export interface SubscriptionData {
  user_id: string;
  subscription_tier: 'free' | 'weekly' | 'monthly' | 'yearly';
  is_active: boolean;
  free_repairs_used: number;
  free_repairs_limit: number;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  models_loaded: boolean;
  gpu_available: boolean;
}

// API Functions

/**
 * Upload and restore an image
 */
export const restoreImage = async (
  imageUri: string,
  userId: string,
  isPremium: boolean = false,
  upscaleFactor: number = 2
): Promise<ProcessImageResponse> => {
  const formData = new FormData();

  // Create file object from URI
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  formData.append('user_id', userId);
  formData.append('is_premium', String(isPremium));
  formData.append('upscale_factor', String(upscaleFactor));

  const response = await apiClient.post<ProcessImageResponse>(
    '/api/restore',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Upload and colorize an image
 */
export const colorizeImage = async (
  imageUri: string,
  userId: string,
  isPremium: boolean = false
): Promise<ProcessImageResponse> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  formData.append('user_id', userId);
  formData.append('is_premium', String(isPremium));

  const response = await apiClient.post<ProcessImageResponse>(
    '/api/colorize',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Upload and upscale an image
 */
export const upscaleImage = async (
  imageUri: string,
  userId: string,
  isPremium: boolean = false,
  upscaleFactor: number = 2
): Promise<ProcessImageResponse> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  formData.append('user_id', userId);
  formData.append('is_premium', String(isPremium));
  formData.append('upscale_factor', String(upscaleFactor));

  const response = await apiClient.post<ProcessImageResponse>(
    '/api/upscale',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Upload and enhance an image
 */
export const enhanceImage = async (
  imageUri: string,
  userId: string,
  isPremium: boolean = false
): Promise<ProcessImageResponse> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  formData.append('user_id', userId);
  formData.append('is_premium', String(isPremium));

  const response = await apiClient.post<ProcessImageResponse>(
    '/api/enhance',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Get user subscription data
 */
export const getSubscription = async (
  userId: string
): Promise<SubscriptionData> => {
  const response = await apiClient.get<SubscriptionData>(
    `/api/subscription/${userId}`
  );

  return response.data;
};

/**
 * Reset free repairs counter
 */
export const resetFreeRepairs = async (userId: string): Promise<void> => {
  await apiClient.post(`/api/subscription/reset-free/${userId}`);
};

/**
 * Check API health
 */
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

export default {
  restoreImage,
  colorizeImage,
  upscaleImage,
  enhanceImage,
  getSubscription,
  resetFreeRepairs,
  checkHealth,
};
