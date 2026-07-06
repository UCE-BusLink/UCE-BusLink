import type { UserProfileResponse, UpdateUserProfileRequest } from '../types/profile';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message || body?.error_description || body?.error || `${response.status} ${response.statusText}`;
    toast.error(message);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json() as Promise<T>;
}

export async function getUserProfile(token: string): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>('/api/v1/users/profile', token);
}

export async function updateUserProfile(
  token: string,
  data: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>('/api/v1/users/profile', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
