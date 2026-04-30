import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Restricted domain
googleProvider.setCustomParameters({
  hd: 'lstlkkc.edu.hk'
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user.email && !result.user.email.endsWith('@lstlkkc.edu.hk')) {
      await signOut(auth);
      throw new Error('Only @lstlkkc.edu.hk domain is allowed.');
    }
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
