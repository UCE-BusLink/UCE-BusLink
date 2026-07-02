import { apiFetch } from './api';

export interface RegisterDeviceRequest {
  fcmToken: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
}

export const notificationService = {
  registerDevice: async (userToken: string, request: RegisterDeviceRequest) => {
    return apiFetch('/api/v1/notifications/register-device', userToken, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
