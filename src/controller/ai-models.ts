import type { Model } from "../types/model";

const API_URL = '/api/ai-models';

interface ApiResponse<T> {
  models?: T;
  error?: string;
}

async function apiRequest<T>(methodName: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'x-method-name': methodName
      }
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function getInstalledModels(): Promise<ApiResponse<string[]>> {
  return apiRequest<string[]>('getInstalledModels');
}

export async function getAllModels(): Promise<ApiResponse<Model[]>> {
  return apiRequest<Model[]>('getAllModels');
}

export default {
  getInstalledModels,
  getAllModels,
};