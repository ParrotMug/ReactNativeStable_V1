import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TOPIC_DATA } from '../assets/data/index';
import RDKitRenderer from '../components/RDKitRenderer';
import { useMoleculePreloader } from '../hooks/useMoleculePreloader';

// --- CONFIG ---
const DURATION = 60; // Sekunden
const BASE_XP = 30;

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function BlitzScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicKey = (params.topic as string) || 'universal';

  // --- STATE: GAMEPLAY ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  // --- PRELOADER (High Performance) ---
  const { cache, isReady, progress } = useMoleculePreloader(questions, 10);

  // --- STATE: STATS ---
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bestCombo, setBestCombo] = useState(1);

  // --- STATE: UI ---
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. INIT
  useEffect(() => {
    const rawData = TOPIC_DATA[topicKey];
    if (rawData && Array.isArray(rawData)) {
      setQuestions(shuffle(rawData));
      setDataLoaded(true);
    } else {
      console.warn("Keine Daten für Blitz:", topicKey);
    }
  }, [topicKey]);

  // 2. TIMER STARTEN (Wenn alles bereit ist)
  useEffect(() => {
    if (!dataLoaded || !isReady || gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dataLoaded, isReady, gameState]);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
  };

  // 3. FRAGE VORBEREITEN
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!currentQ || gameState !== 'playing') return;

    let opts: any[] = [];
    
    // FIX: Objekt-Support (WICHTIG!)
    if (Array.isArray(currentQ.options)) {
      opts = currentQ.options.map((o: any, i: number) => ({ 
        key: o.key || ['A', 'B', 'C', 'D'][i], 
        text: o.text || o 
      }));
    } else if (typeof currentQ.options === 'object' && currentQ.options !== null) {
      opts = Object.entries(currentQ.options).map(([k, v]) => ({ 
        key: k, 
        text: String(v) 
      }));
    }

    const isRS = opts.some(o => o.text.toString().endsWith('R')) && opts.some(o => o.text.toString().endsWith('S'));
    if (isRS) {
      opts.sort((a, b) => {
         const valA = a.text.toString().toUpperCase();
         const valB = b.text.toString().toUpperCase();
         if (valA.endsWith('S') && !valB.endsWith('S')) return -1; 
         if (!valA.endsWith('S') && valB.endsWith('S')) return 1;
         return 0;
      });
    } else {
      opts = shuffle(opts);
    }
    setShuffledOptions(opts);
    setSelectedOption(null);
    setIsCorrect(null);
  }, [currentIndex, currentQ, gameState]);

  // --- LOGIK ---
  const handleAnswer = (key: string) => {
    if (selectedOption || gameState !== 'playing') return; 

    setSelectedOption(key);
    const correct = key === currentQ.correct;
    setIsCorrect(correct);

    if (correct) {
      const gained = 10 * combo;
      setScore(s => s + gained);
      setCombo(c => {
        const next = Math.min(c + 1, 5); 
        setBestCombo(b => Math.max(b, next));
        return next;
      });
    } else {
      setCombo(1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Infinite Loop im Blitz
        setQuestions(shuffle(questions));
        setCurrentIndex(0);
      }
    }, 600); 
  };

  const calculateXP = () => {
    const bonusScore = score * 0.1;
    const streakDays = 1; 
    const multiplier = 1 + 0.01 * streakDays;
    const raw = (BASE_XP + bonusScore) * multiplier;
    return Math.ceil(raw);
  };

  const getBtnStyle = (key: string) => {
    const base = styles.optionBtn;
    if (!selectedOption) return base; 
    if (key === currentQ.correct) return [base, styles.optionBtnCorrect]; 
    if (key === selectedOption && !isCorrect) return [base, styles.optionBtnWrong]; 
    return [base, { opacity: 0.5 }];
  };

  // --- LADESCREEN ---
  if (!dataLoaded || !isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2a7fff" />
        <Text style={{marginTop:20, fontWeight:'600', fontSize:16, color:'#334155'}}>
          Blitz wird geladen...
        </Text>
        <View style={{marginTop:10, width:200, height:6, backgroundColor:'#e2e8f0', borderRadius:3}}>
           <View style={{width: `${progress * 100}%`, height:'100%', backgroundColor:'#2a7fff', borderRadius:3}} />
        </View>
      </View>
    );
  }

  // --- ENDSCREEN ---
  if (gameState === 'finished') {
    const xp = calculateXP();
    return (
      <SafeAreaView style={styles.safeArea}>
         <View style={styles.endContainer}>
            <Text style={styles.endTitle}>Zeit vorbei ⏱️</Text>
            <View style={styles.statRow}>
               <View style={styles.statBox}><Text style={styles.statLabel}>SCORE</Text><Text style={styles.statValue}>{score}</Text></View>
               <View style={styles.statBox}><Text style={styles.statLabel}>BEST COMBO</Text><Text style={styles.statValue}>x{bestCombo}</Text></View>
            </View>
            <View style={styles.xpCard}>
               <Text style={styles.xpHeader}>Deine Belohnung</Text>
               <View style={styles.xpLine}><Text>Basis:</Text><Text>+{BASE_XP} XP</Text></View>
               <View style={styles.xpLine}><Text>Score-Bonus:</Text><Text>+{Math.round(score * 0.1)} XP</Text></View>
               <View style={styles.xpLine}><Text>Streak (Tag 1):</Text><Text>x 1.01</Text></View>
               <View style={styles.divider} />
               <View style={styles.xpLineTotal}><Text style={styles.xpTotalText}>Gesamt:</Text><Text style={styles.xpTotalVal}>+{xp} XP</Text></View>
            </View>
            <View style={styles.controls}>
               <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => router.replace('/practice')}><Text style={styles.btnGhostText}>‹ Dashboard</Text></TouchableOpacity>
               <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => router.replace({ pathname: '/blitz', params: { topic: topicKey, ts: Date.now() } })}><Text style={styles.btnPrimaryText}>Nochmal spielen</Text></TouchableOpacity>
            </View>
         </View>
      </SafeAreaView>
    );
  }

  if (!currentQ) return <Text>Fehler</Text>;

  // --- GAMEPLAY ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Text style={{fontSize:24}}>‹</Text></TouchableOpacity>
        <View style={styles.hudContainer}>
           <View style={[styles.pill, timeLeft < 10 && styles.pillRed]}>
              <Text style={[styles.pillText, timeLeft < 10 && styles.pillTextRed]}>{timeLeft}s</Text>
           </View>
           <View style={styles.pill}><Text style={styles.pillText}>Score: {score}</Text></View>
           {combo > 1 && (<View style={[styles.pill, styles.pillCombo]}><Text style={styles.pillTextCombo}>Combo x{combo}</Text></View>)}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.mediaContainer}>
           {currentQ.arrow_label ? (
             <View style={styles.synthesisRow}>
                <View style={styles.synBox}>
                   <RDKitRenderer smiles={currentQ.smiles} cachedSvg={cache.get(currentQ.smiles)} width={90} height={90} />
                </View>
                <View style={styles.synArrow}>
                   <Text style={{fontSize:10, textAlign:'center', marginBottom:2}}>{currentQ.arrow_label}</Text>
                   <View style={styles.arrowContainer}><View style={styles.arrowLine} /><View style={styles.arrowHead} /></View>
                </View>
                <View style={[styles.synBox, styles.synProduct, currentQ.product && { borderStyle:'solid', borderWidth:0 }]}>
                   {currentQ.product ? (
                      <RDKitRenderer smiles={currentQ.product} cachedSvg={cache.get(currentQ.product)} width={90} height={90} />
                   ) : (<Text style={{fontSize:30, color:'#cbd5e1', fontWeight:'bold'}}>?</Text>)}
                </View>
             </View>
           ) : (
             currentQ.image ? (<Image source={{ uri: currentQ.image }} style={styles.mainImage} />) : (
                <View style={styles.renderBox}>
                    <RDKitRenderer smiles={currentQ.smiles} cachedSvg={cache.get(currentQ.smiles)} width={300} height={180} />
                </View>
             )
           )}
        </View>

        <View style={styles.optionsGrid}>
          {shuffledOptions.map((opt) => (
            <TouchableOpacity 
              key={opt.key} 
              style={getBtnStyle(opt.key)}
              onPress={() => handleAnswer(opt.key)}
              activeOpacity={0.8}
            >
              {currentQ.visual_options ? (
                 <View style={{ width: '100%', height: '100%', alignItems:'center', justifyContent:'center', pointerEvents: 'none' }}>
                    <RDKitRenderer smiles={opt.text} cachedSvg={cache.get(opt.text)} width={100} height={80} />
                 </View>
              ) : (<Text style={styles.optionText}>{opt.text}</Text>)}
            </TouchableOpacity>
          ))}
        </View>

        {selectedOption && !isCorrect && (
           <Text style={{textAlign:'center', marginTop:20, color:'#ef4444', fontWeight:'bold'}}>Falsch!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 50 },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, marginBottom: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e7eaf0', marginRight: 12 },
  hudContainer: { flex:1, flexDirection: 'row', gap: 8 },
  pill: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e7eaf0' },
  pillRed: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  pillCombo: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  pillText: { fontWeight: '700', fontSize: 13, color: '#334155' },
  pillTextRed: { color: '#ef4444' },
  pillTextCombo: { color: '#2563eb', fontWeight: '800' },
  questionText: { fontSize: 18, fontWeight: '600', color: '#1b2432', textAlign: 'center', marginBottom: 20 },
  mediaContainer: { alignItems: 'center', marginBottom: 24, minHeight: 150, justifyContent:'center' },
  mainImage: { width: 300, height: 200, resizeMode: 'contain', borderRadius: 12 },
  renderBox: { width: 320, height: 200, backgroundColor:'#fff', borderRadius:12, alignItems:'center', justifyContent:'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  optionBtn: { width: '46%', height: 120, padding: 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e7eaf0', alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: {width:0,height:2}, shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  optionBtnCorrect: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  optionBtnWrong: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  optionText: { fontSize: 17, fontWeight: '700', color: '#334155', textAlign:'center' },
  synthesisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e7eaf0' },
  synBox: { width: '30%', height: 100, justifyContent: 'center', alignItems: 'center' },
  synArrow: { width: '30%', alignItems: 'center' },
  arrowContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  arrowLine: { flex: 1, height: 2, backgroundColor: '#334155' },
  arrowHead: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#334155', marginLeft: -1 },
  synProduct: { backgroundColor: '#f8fafc', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', overflow:'hidden' },
  endContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  endTitle: { fontSize: 28, fontWeight: '800', marginBottom: 30, color: '#1e293b' },
  statRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  xpCard: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 30 },
  xpHeader: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  xpLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  xpLineTotal: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTotalText: { fontWeight: '700' },
  xpTotalVal: { fontWeight: '800', color: '#2563eb' },
  controls: { width: '100%', gap: 12 },
  btn: { padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  btnGhostText: { color: '#64748b', fontWeight: '600' },
});
