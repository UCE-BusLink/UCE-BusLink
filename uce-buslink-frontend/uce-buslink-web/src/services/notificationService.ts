import { apiFetch } from './api'

export interface RegisterDeviceResponse {
  id: string
  usuarioId: string
  platform: string
  estado: string
  fechaRegistro: string
}

export function registerDevice(token: string, fcmToken: string): Promise<RegisterDeviceResponse> {
  return apiFetch<RegisterDeviceResponse>('/api/v1/notifications/register-device', token, {
    method: 'POST',
    body: JSON.stringify({ fcmToken, platform: 'WEB' }),
  })
}
