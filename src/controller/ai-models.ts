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

export async function installModel(model: Model): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-method-name': 'installModel',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: model })
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let message = '';

    while (true) {
      const { value, done } = reader ? await reader.read() : { value: undefined, done: true };
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          message += line.slice(5);
        } else if (line === '') {
          const data = JSON.parse(message);
          if (data.progress) {
            console.log(`Download progress: ${data.progress}%`);
          } else if (data.message) {
            console.log(data.message);
          } else if (data.error) {
            throw new Error(data.error);
          }
          message = '';
        }
      }
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function deleteModel(model: Model): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-method-name': 'deleteModel',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: model })
    });
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}


export default {
  getInstalledModels,
  getAllModels,
  installModel,
  deleteModel
};