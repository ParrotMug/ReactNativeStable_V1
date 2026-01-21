import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router'; // <--- WICHTIG: Das ist neu

export default function HomeScreen() {
  const router = useRouter(); // <--- WICHTIG: Damit wir navigieren können

  // Kleines Helferlein für das Datum
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* --- TOPBAR --- */}
        <View style={styles.topbar}>
          <Text style={styles.brand}>QuizMVP</Text>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{today}</Text>
            <Text style={[styles.metaText, { opacity: 0.3 }]}> • </Text>
            <Text style={styles.metaStreak}>🔥 0</Text>
          </View>
        </View>

        <View style={styles.contentPadding}>

          {/* --- ACCOUNT TILE --- */}
          <TouchableOpacity style={styles.sectionTile} activeOpacity={0.7}>
            <View style={styles.flexRow}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 24 }}>🔐</Text>
              </View>
              <View>
                <Text style={styles.tileTitle}>Anmelden</Text>
                <Text style={styles.tileSub}>Speichere Fortschritt</Text>
              </View>
            </View>
            <View style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Login</Text>
            </View>
          </TouchableOpacity>

          {/* --- MVP HERO --- */}
          <LinearGradient
            colors={['rgba(0,212,179,0.14)', 'rgba(0,212,179,0)']}
            style={styles.mvpHero}
          >
            <View style={styles.flexRow}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 22 }}>👋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mvpTitle}>Heute 10 Minuten Chemie.</Text>
                <Text style={styles.mvpSub}>Zeit für deine tägliche Session.</Text>
              </View>
            </View>
          </LinearGradient>

          {/* --- ACTION GRID (Üben / Lernen) --- */}
          <View style={styles.actionGrid}>

            {/* Üben Button - JETZT MIT FUNKTION */}
            <TouchableOpacity 
              style={styles.gridItem} 
              activeOpacity={0.9}
              onPress={() => router.push('/practice')} // <--- Hier passiert die Magie
            >
              <LinearGradient
                colors={['#2a7fff', '#4cc7ff']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionIcon}>⚡️</Text>
                <Text style={styles.actionLabel}>Üben</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Lernen Button (noch ohne Funktion) */}
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.9}>
              <LinearGradient
                colors={['#2a7fff', '#4cc7ff']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionIcon}>📚</Text>
                <Text style={styles.actionLabel}>Lernen</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* --- DAILY GOAL --- */}
          <View style={[styles.sectionTile, { display: 'flex', flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 8 }]}>
              <Text style={styles.tileTitle}>Tagesziel</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>0 / 15</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.xpLine}>
              <LinearGradient
                colors={['#7aa6ff', '#6de1ff']}
                style={[styles.xpFill, { width: '30%' }]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>

            <Text style={[styles.tileSub, { marginTop: 10, fontSize: 13 }]}>
              15 Fragen heute = Streak behalten.
            </Text>
          </View>

          {/* --- FEEDBACK BUTTON --- */}
          <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 10 }}>
            <LinearGradient
              colors={['#f59e0b', '#fbbf24']} 
              style={[styles.actionBtn, { flexDirection: 'row', gap: 10, height: 60 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionIcon}>📣</Text>
              <Text style={styles.actionLabel}>Feedback</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  container: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 20,
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f3d35',
    letterSpacing: -0.5,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  metaStreak: {
    fontSize: 12,
    fontWeight: '700',
    color: '#eca627',
  },
  sectionTile: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    // fontSize funktioniert nicht direkt auf View, aber wir lassen es clean
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b2432',
  },
  tileSub: {
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 2,
  },
  smallBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  mvpHero: {
    borderWidth: 1,
    borderColor: '#e7eaf0',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mvpTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0b1220',
  },
  mvpSub: {
    color: '#5f6b7a',
    fontSize: 13,
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
  },
  actionBtn: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#2a7fff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: '#fff',
  },
  actionLabel: {
    fontWeight: '800',
    fontSize: 15,
    color: '#fff',
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#dbe7ff',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1b2432',
  },
  xpLine: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#eef1f8',
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  xpFill: {
    height: '100%',
    borderRadius: 99,
  }
});
