import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router'; 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// --- DATEN ---
const MVP_TOPICS_OC = [
  { key: "universal", name: "Alle Fragen", icon: "🔀", isHero: true },
  { key: "synthesis", name: "Synthese",          icon: "🧪" },
  { key: "named",     name: "Namensreaktionen",  icon: "👨‍🔬" },
  { key: "iupac",     name: "Nomenklatur",       icon: "🧾" },
  { key: "stereo",    name: "Stereochemie",      icon: "🧭" },
  { key: "functional",name: "Funkt. Gruppen",    icon: "🧩" },
  { key: "reagents",  name: "Reagenzien",        icon: "⚗️" },
];

const LOCKED_TOPICS = [
  { key: "mechanisms",   name: "Mechanismen",    icon: "🧠" },
  { key: "spectroscopy", name: "Spektroskopie",  icon: "📈" },
];

const CATEGORIES = [
  { key: "oc", label: "Organisch", active: true },
  { key: "ac", label: "Anorganisch", active: false },
  { key: "pc", label: "Physikalisch", active: false },
  { key: "bc", label: "Biochemie", active: false },
];

const MODES = [
  { key: 'sandbox', name: 'Sandbox', icon: '🧩', sub: 'Fragen wiederholen sich - unendliches Lernen' },
  { key: 'blitz',   name: 'Blitzquiz', icon: '⚡️', sub: '60s Zeitdruck - Highscore knacken' },
  { key: 'exam',    name: 'Prüfung',   icon: '🎯', sub: 'Prüfungsmodus mit End-Auswertung' },
];

export default function PracticeScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1); 
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("oc");

  const getPageTitle = () => {
    if (step === 1) return "Üben";
    const modeObj = MODES.find(m => m.key === selectedMode);
    return modeObj ? modeObj.name : "Thema wählen";
  };

  const handleTopicClick = (topicKey: string, topicName: string) => {
    // Ziel bestimmen
    let targetPath = "/sandbox"; // Standard

    if (selectedMode === 'blitz') targetPath = "/blitz";
    if (selectedMode === 'exam') targetPath = "/exam"; // NEU: Exam hinzufügen!

    // Navigieren
    router.push({
      pathname: targetPath as any, 
      params: { 
        topic: topicKey
      }
    });
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar style="dark" />

      {/* --- TOPBAR --- */}
      <View style={styles.topbar}>
        <TouchableOpacity 
          onPress={() => step === 2 ? setStep(1) : router.back()} 
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{getPageTitle()}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>

        {/* === STEP 1: MODUS WÄHLEN === */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionHeader}>Modus wählen</Text>
            <View style={styles.gridOneColumn}>
              {MODES.map((m) => (
                <TouchableOpacity 
                  key={m.key}
                  style={styles.dashTileWide}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedMode(m.key);
                    setStep(2);
                  }}
                >
                  <View style={styles.tileIconBox}>
                    <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tileTitle}>{m.name}</Text>
                    <Text style={styles.tileSub}>{m.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* === STEP 2: THEMA WÄHLEN === */}
        {step === 2 && (
          <View>
            <View style={styles.step2Header}>
              <Text style={styles.sectionHeaderNoMargin}>Thema wählen</Text>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Modus ändern</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => cat.active && setSelectedCategory(cat.key)}
                  style={[
                    styles.chip, 
                    selectedCategory === cat.key && styles.chipActive,
                    !cat.active && { opacity: 0.5 }
                  ]}
                  activeOpacity={cat.active ? 0.7 : 1}
                >
                  <Text style={[
                    styles.chipText,
                    selectedCategory === cat.key && styles.chipTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedCategory === 'oc' ? (
              <View style={styles.gridTwoColumn}>
                {MVP_TOPICS_OC.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tile, t.isHero && styles.tileHero]}
                    onPress={() => handleTopicClick(t.key, t.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tileIconBoxSmall}>
                      <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                    </View>
                    <Text style={styles.tileTitleSmall}>{t.name}</Text>
                  </TouchableOpacity>
                ))}

                {LOCKED_TOPICS.map((t) => (
                  <View key={t.key} style={[styles.tile, styles.tileDisabled]}>
                    <View style={[styles.tileIconBoxSmall, { opacity: 0.6 }]}>
                      <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                    </View>
                    <Text style={[styles.tileTitleSmall, { color: '#94a3b8' }]}>{t.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>BALD</Text>
                    </View>
                  </View>
                ))}

                 <View style={[styles.tile, styles.tileDisabled]}>
                    <View style={[styles.tileIconBoxSmall, { opacity: 0.6 }]}>
                      <Text style={{ fontSize: 24 }}>🔒</Text>
                    </View>
                    <Text style={[styles.tileTitleSmall, { color: '#94a3b8' }]}>Mehr Themen</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>BALD</Text>
                    </View>
                  </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Noch keine Inhalte für diese Kategorie.</Text>
              </View>
            )}
          </View>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2432',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionHeaderNoMargin: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2432',
  },
  step2Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  ghostBtn: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7eaf0',
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5f6b7a',
  },
  gridOneColumn: {
    gap: 14,
  },
  dashTileWide: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  tileIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#eff6ff', 
    borderWidth: 1,
    borderColor: '#e7eaf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b2432',
    marginBottom: 2,
  },
  tileSub: {
    fontSize: 13,
    color: '#5f6b7a',
    lineHeight: 18,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7eaf0',
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: '#fbfdff', 
    borderColor: '#2a7fff',     
    borderWidth: 2, 
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b2432',
  },
  chipTextActive: {
    color: '#2a7fff', 
  },
  gridTwoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '48%', 
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e7eaf0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 2,
  },
  tileHero: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tileDisabled: {
    opacity: 0.7,
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
  },
  tileIconBoxSmall: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#e7eaf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileTitleSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2432',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
