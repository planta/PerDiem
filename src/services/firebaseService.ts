import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '527462008462-s3g0n50jfv61ibd8kqjcdj9s3hs9p8jt.apps.googleusercontent.com',
});

export const firebaseService = {
  signInWithGoogle: async () => {
    try {
      await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();

      const googleCredential = auth.GoogleAuthProvider.credential(
        null,
        accessToken,
      );

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  signOut: async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getCurrentUser: () => {
    return auth().currentUser;
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
  },
};
