import { apiFetch } from './api';

export interface BasicUserResponse {
  id: string;
  nombres: string;
  apellidos: string;
  rol: string;
}

export async function fetchBasicUserInfo(token: string, userId: string): Promise<BasicUserResponse> {
  return apiFetch<BasicUserResponse>(`/api/v1/users/${userId}/basic`, token);
}
