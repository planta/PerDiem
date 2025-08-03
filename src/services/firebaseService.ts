import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  // Use the web client ID from google-services.json
  webClientId:
    '527462008462-hme05phmb8f59h4080k3enobql9ip8a6.apps.googleusercontent.com',
});

export const firebaseService = {
  signInWithGoogle: async () => {
    try {
      console.log('Starting Google Sign-In process...');
      console.log('Platform:', Platform.OS);

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('Google Play Services check passed');

      // Sign in with Google
      await GoogleSignin.signIn();
      console.log('Google Sign-In successful');

      // Get the access token
      const { accessToken } = await GoogleSignin.getTokens();
      console.log('Access token obtained');

      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(
        null,
        accessToken,
      );
      console.log('Firebase credential created');

      // Sign in to Firebase
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      console.log('Firebase authentication successful');

      // Serialize the Firebase user object to only include serializable data
      const serializedUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };

      console.log('User serialized successfully');
      return {
        success: true,
        user: serializedUser,
      };
    } catch (error: any) {
      console.error('Google Sign-In Error Details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        platform: Platform.OS,
      });

      // Provide more specific error messages
      let errorMessage = 'Google Sign-In failed';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled by the user';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services is not available';
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        errorMessage = 'Sign-in is required';
      } else if (error.code === 'INVALID_ACCOUNT') {
        errorMessage = 'Invalid account';
      } else if (error.code === 'SIGN_IN_FAILED') {
        errorMessage = 'Sign-in failed';
      } else if (error.code === 'DEVELOPER_ERROR') {
        errorMessage = 'Developer error - check your configuration';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
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
