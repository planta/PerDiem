import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { store, persistor } from './store';
import { AppNavigator } from './navigation';

// Toast component with safe area insets
const ToastWithSafeArea = () => {
  const insets = useSafeAreaInsets();

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#4CAF50',
          marginBottom: insets.bottom,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#FF3B30',
          marginBottom: insets.bottom,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),
  };

  return <Toast config={toastConfig} position="bottom" />;
};

function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StatusBar barStyle={'light-content'} />
            <AppNavigator />
            <ToastWithSafeArea />
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
