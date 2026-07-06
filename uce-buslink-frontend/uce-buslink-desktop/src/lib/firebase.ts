import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import type { Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyAF7aa6E8zfX1HSbj3cRiYIFRmH0U1YsVE',
  authDomain: 'uce-buslink.firebaseapp.com',
  projectId: 'uce-buslink',
  storageBucket: 'uce-buslink.firebasestorage.app',
  messagingSenderId: '679640129459',
  appId: '1:679640129459:web:5cc1097c19b5fe910635c6',
}

const app = initializeApp(firebaseConfig)

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  const supported = await isSupported().catch(() => false)
  return supported ? getMessaging(app) : null
}
