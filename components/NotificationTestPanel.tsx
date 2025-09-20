import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function NotificationTestPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test Panel</Text>
      <Text style={styles.subtitle}>Feature coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});