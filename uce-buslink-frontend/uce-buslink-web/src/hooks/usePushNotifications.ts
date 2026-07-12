import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { getToken, onMessage } from 'firebase/messaging'
import { firebaseConfig, getMessagingIfSupported } from '../lib/firebase'
import { registerDevice } from '../services/notificationService'

const VAPID_KEY = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined) || undefined

export function usePushNotifications() {
  const { isSignedIn, getToken: getAuthToken } = useAuth()
  const navigate = useNavigate()
  const startedRef = useRef(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    function handleSwMessage(event: MessageEvent) {
      if (event.data?.type === 'PUSH_NAVIGATE' && typeof event.data.url === 'string') {
        navigate(event.data.url)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSwMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage)
  }, [navigate])

  useEffect(() => {
    if (!isSignedIn || startedRef.current) return
    startedRef.current = true

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    async function setup() {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) return

      const messaging = await getMessagingIfSupported()
      if (!messaging) return

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const swParams = new URLSearchParams(
        firebaseConfig as unknown as Record<string, string>,
      )
      // Scope propio y distinto al del service worker de la PWA (que vive en "/"):
      // si comparten scope, el navegador trata el registro de este SW como una
      // "actualizacion externa" de aquel, y vite-plugin-pwa fuerza un reload en bucle.
      await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swParams}`, {
        scope: '/firebase-cloud-messaging-push-scope',
      })
      const registration = await navigator.serviceWorker.ready

      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      })
      if (!fcmToken || cancelled) return

      const authToken = await getAuthToken({ template: 'uce-buslink' })
      if (!authToken || cancelled) return

      await registerDevice(authToken, fcmToken)

      unsubscribe = onMessage(messaging, (payload) => {
        registration.showNotification(payload.notification?.title ?? 'Notificación', {
          body: payload.notification?.body ?? '',
          icon: '/favicon.png',
          data: { url: payload.data?.url },
        })
      })
    }

    setup().catch((error) => {
      startedRef.current = false
      console.error('[PUSH] No se pudo registrar el dispositivo:', error)
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [isSignedIn, getAuthToken])
}
