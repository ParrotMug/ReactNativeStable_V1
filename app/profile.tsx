import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserStats {
  total_quizzes: number;
  best_score: number;
  total_correct: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.log('No stats found for user');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a7fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profil</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          {user ? (
            <>
              <Text style={styles.userName}>{user.email}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Verifiziert</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.userName}>Gast</Text>
              <View style={[styles.statusBadge, styles.statusBadgeGuest]}>
                <Text style={[styles.statusText, styles.statusTextGuest]}>Nicht angemeldet</Text>
              </View>
            </>
          )}
        </View>

        {user ? (
          <>
            <Text style={styles.sectionHeader}>Account-Details</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Text style={{ fontSize: 18 }}>📧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>E-Mail</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Text style={{ fontSize: 18 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Mitglied seit</Text>
                  <Text style={styles.infoValue}>
                    {new Date(user.created_at).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Text style={{ fontSize: 18 }}>🔑</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Account-ID</Text>
                  <Text style={styles.infoValueSmall}>{user.id.substring(0, 12)}...</Text>
                </View>
              </View>
            </View>

            {stats && (
              <>
                <Text style={styles.sectionHeader}>Statistiken</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.total_quizzes}</Text>
                    <Text style={styles.statLabel}>Quizze</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.best_score}%</Text>
                    <Text style={styles.statLabel}>Beste Note</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.total_correct}</Text>
                    <Text style={styles.statLabel}>Richtige</Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={styles.signOutIconBox}>
                <Text style={{ fontSize: 18 }}>🚪</Text>
              </View>
              <Text style={styles.signOutText}>Abmelden</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.guestCard}>
              <View style={styles.guestIconBox}>
                <Text style={{ fontSize: 28 }}>🔐</Text>
              </View>
              <Text style={styles.guestTitle}>Fortschritt speichern?</Text>
              <Text style={styles.guestSub}>
                Melde dich an, um deinen Lernfortschritt zu speichern und auf allen Geräten zu synchronisieren.
              </Text>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Jetzt anmelden</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={{ fontSize: 16 }}>☁️</Text>
                </View>
                <Text style={styles.featureText}>Fortschritt in der Cloud speichern</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={{ fontSize: 16 }}>📱</Text>
                </View>
                <Text style={styles.featureText}>Auf allen Geräten synchronisieren</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={{ fontSize: 16 }}>📊</Text>
                </View>
                <Text style={styles.featureText}>Detaillierte Lernstatistiken</Text>
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f6f7fb',
    borderBottomWidth: 1,
    borderBottomColor: '#e7eaf0',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 28,
    lineHeight: 28,
    color: '#1b2432',
    fontWeight: '300',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2432',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#2a7fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: "#2a7fff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1b2432',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  statusBadgeGuest: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  statusTextGuest: {
    color: '#d97706',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b2432',
    marginBottom: 14,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e7eaf0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: '#5f6b7a',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1b2432',
  },
  infoValueSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5f6b7a',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#e7eaf0',
    marginVertical: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7eaf0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2a7fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5f6b7a',
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 10,
  },
  signOutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7eaf0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  guestIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1b2432',
    marginBottom: 10,
  },
  guestSub: {
    fontSize: 14,
    color: '#5f6b7a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#2a7fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: "#2a7fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e7eaf0',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1b2432',
    fontWeight: '600',
  },
});
