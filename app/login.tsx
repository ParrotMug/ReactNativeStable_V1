import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Login fehlgeschlagen', error.message);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          Alert.alert('Registrierung fehlgeschlagen', error.message);
        } else {
          Alert.alert('Erfolg', 'Account erstellt! Bitte bestätige deine E-Mail.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      Alert.alert('Fehler', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{isLogin ? 'Anmelden' : 'Registrieren'}</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentPadding}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 32 }}>{isLogin ? '👋' : '✨'}</Text>
            </View>
            <Text style={styles.heroTitle}>
              {isLogin ? 'Willkommen zurück!' : 'Neuen Account erstellen'}
            </Text>
            <Text style={styles.heroSub}>
              {isLogin 
                ? 'Melde dich an, um deinen Fortschritt zu speichern.' 
                : 'Registriere dich, um deinen Lernfortschritt zu sichern.'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>E-Mail</Text>
            <TextInput
              style={styles.input}
              placeholder="deine@email.de"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Passwort</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Anmelden' : 'Registrieren'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? 'Noch kein Account? Registrieren'
                  : 'Bereits registriert? Anmelden'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.guestTile} onPress={handleSkip} activeOpacity={0.7}>
            <View style={styles.guestIconBox}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Als Gast fortfahren</Text>
              <Text style={styles.guestSub}>Ohne Anmeldung die App testen</Text>
            </View>
            <View style={styles.arrowBox}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  keyboardView: {
    flex: 1,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#e7eaf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1b2432',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: '#5f6b7a',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e7eaf0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5f6b7a',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1b2432',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e7eaf0',
  },
  primaryButton: {
    backgroundColor: '#2a7fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: "#2a7fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#2a7fff',
    fontSize: 14,
    fontWeight: '600',
  },
  guestTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e7eaf0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  guestIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2432',
  },
  guestSub: {
    fontSize: 13,
    color: '#5f6b7a',
    marginTop: 2,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#5f6b7a',
    fontWeight: '300',
  },
});
