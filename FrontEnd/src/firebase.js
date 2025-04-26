import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCxz61Xc__YrV2UcVEHDelwiWWI_TIUxzw',
  authDomain: 'tutorverse-7a900.firebaseapp.com',
  projectId: 'tutorverse-7a900',
  storageBucket: 'tutorverse-7a900.appspot.com',
  messagingSenderId: '453776834553',
  appId: '1:453776834553:web:b6218ccb2436249fb1c728',
  measurementId: 'G-7Y4EGQXGCV'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
