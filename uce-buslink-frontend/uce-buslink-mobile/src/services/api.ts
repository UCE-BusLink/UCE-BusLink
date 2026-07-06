import { API_URL } from '../config/env';
import type { UserProfileResponse, UpdateUserProfileRequest } from '../types/profile';

const BASE_URL = API_URL;

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message || body?.error || `${response.status} ${response.statusText}`;
    throw new Error(message);
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
