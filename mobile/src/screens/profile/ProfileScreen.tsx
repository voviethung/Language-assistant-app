import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuthStore} from '@/store/authStore';
import {useHistoryStore} from '@/store/historyStore';

export default function ProfileScreen() {
  const {session, signOut} = useAuthStore();
  const {sessions} = useHistoryStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: signOut},
    ]);
  };

  const user = session?.user;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.user_metadata?.full_name ?? 'User'}
        </Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{sessions.filter(s => s.synced).length}</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  content: {alignItems: 'center', padding: 32, gap: 12},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {color: '#fff', fontSize: 32, fontWeight: 'bold'},
  name: {fontSize: 20, fontWeight: '700', color: '#111827'},
  email: {fontSize: 14, color: '#6b7280'},
  statsRow: {flexDirection: 'row', gap: 32, marginTop: 16},
  stat: {alignItems: 'center'},
  statNum: {fontSize: 24, fontWeight: '700', color: '#6366f1'},
  statLabel: {fontSize: 13, color: '#6b7280'},
  signOutBtn: {
    marginTop: 32,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signOutText: {color: '#ef4444', fontWeight: '600', fontSize: 15},
});
