import { PublicClientApplication } from '@azure/msal-browser';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: `${window.location.origin}/blank.html`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
});

export const msalReady = msalInstance.initialize();

export const microsoftLoginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
