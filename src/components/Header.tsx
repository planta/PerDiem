import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  onLogoutPress: () => void;
  loading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLogoutPress,
  loading = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.header, { paddingTop: insets.top + 15 }]}
      testID="header"
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.headerLogo}
        testID="header-logo"
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogoutPress}
        disabled={loading}
        testID="logout-button"
      >
        <Text style={styles.logoutButtonText}>
          {loading ? 'Signing out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0171EA',
  },
  headerLogo: {
    width: 60,
    height: 34,
    resizeMode: 'contain',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
