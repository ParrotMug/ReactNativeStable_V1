import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TOPIC_DATA } from '../assets/data/index';
import RDKitRenderer from '../components/RDKitRenderer';
import { useMoleculePreloader } from '../hooks/useMoleculePreloader';

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

function calculateGrade(percent: number) {
  if (percent >= 0.95) return { grade: "1.0", color: "#10b981", label: "Sehr gut" };
  if (percent >= 0.90) return { grade: "1.3", color: "#10b981", label: "Sehr gut" };
  if (percent >= 0.85) return { grade: "1.7", color: "#34d399", label: "Gut" };
  if (percent >= 0.80) return { grade: "2.0", color: "#34d399", label: "Gut" };
  if (percent >= 0.75) return { grade: "2.3", color: "#a3e635", label: "Gut" };
  if (percent >= 0.70) return { grade: "2.7", color: "#facc15", label: "Befriedigend" };
  if (percent >= 0.65) return { grade: "3.0", color: "#facc15", label: "Befriedigend" };
  if (percent >= 0.60) return { grade: "3.3", color: "#fbbf24", label: "Befriedigend" };
  if (percent >= 0.55) return { grade: "3.7", color: "#fb923c", label: "Ausreichend" };
  if (percent >= 0.50) return { grade: "4.0", color: "#f87171", label: "Ausreichend" };
  return { grade: "5.0", color: "#ef4444", label: "Nicht bestanden" };
}

export default function ExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicKey = (params.topic as string) || 'universal';

  // State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  // --- PRELOADER (High Performance) ---
  const { cache, isReady, progress } = useMoleculePreloader(questions, 10);

  // User Progress
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

  // 1. Init
  useEffect(() => {
    const rawData = TOPIC_DATA[topicKey];
    if (rawData && Array.isArray(rawData)) {
      const examSet = shuffle(rawData).slice(0, 20); 
      setQuestions(examSet);
      setDataLoaded(true);
    }
  }, [topicKey]);

  // 2. Prepare Question
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
  }, [currentIndex, currentQ, gameState]);

  // --- LOGIK ---
  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert("Bitte wählen", "Du musst eine Antwort auswählen, um fortzufahren.");
      return;
    }

    const isCorrect = selectedOption === currentQ.correct;
    const chosenObj = shuffledOptions.find(o => o.key === selectedOption);
    const answerText = chosenObj ? chosenObj.text : "—";

    const resultEntry = {
      question: currentQ.question,
      isCorrect: isCorrect,
      userAnswer: answerText,
      correctAnswer: currentQ.correct 
    };

    const newResults = [...userResults, resultEntry];
    setUserResults(newResults);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameState('finished');
    }
  };

  const getBtnStyle = (key: string) => {
    const base = styles.optionBtn;
    if (key === selectedOption) return [base, styles.optionBtnSelected];
    return base;
  };

  // --- LADESCREEN ---
  if (!dataLoaded || !isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2a7fff" />
        <Text style={{marginTop:20, fontWeight:'600', fontSize:16, color:'#334155'}}>
          Prüfung wird vorbereitet...
        </Text>
        <View style={{marginTop:10, width:200, height:6, backgroundColor:'#e2e8f0', borderRadius:3}}>
           <View style={{width: `${progress * 100}%`, height:'100%', backgroundColor:'#2a7fff', borderRadius:3}} />
        </View>
      </View>
    );
  }

  // --- ENDSCREEN ---
  if (gameState === 'finished') {
    const total = userResults.length;
    const correctCount = userResults.filter(r => r.isCorrect).length;
    const percentage = total > 0 ? correctCount / total : 0;
    const evaluation = calculateGrade(percentage);

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.gradeBox}>
             <Text style={[styles.gradeLabel, {color: evaluation.color}]}>{evaluation.label}</Text>
             <Text style={[styles.gradeHuge, {color: evaluation.color}]}>{evaluation.grade}</Text>
             <Text style={styles.gradeSub}>{correctCount} von {total} Punkten ({Math.round(percentage * 100)}%)</Text>
          </View>

          <View style={styles.controlsRow}>
             <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => router.replace('/practice')}><Text style={styles.btnGhostText}>Beenden</Text></TouchableOpacity>
             <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => router.replace({ pathname: '/exam', params: { topic: topicKey, ts: Date.now() } })}><Text style={styles.btnPrimaryText}>Nochmal</Text></TouchableOpacity>
          </View>

          <Text style={styles.reviewHeader}>Auswertung</Text>
          <View style={styles.reviewList}>
             {userResults.map((res, i) => (
               <View key={i} style={[styles.reviewItem, res.isCorrect ? styles.reviewOk : styles.reviewBad]}>
                  <Text style={styles.reviewQ}>#{i+1} {res.question}</Text>
                  <Text style={styles.reviewAns}>
                    {res.isCorrect ? "✅ " : "❌ "}
                    {res.userAnswer.length > 20 && !res.userAnswer.includes(' ') ? '[Struktur]' : res.userAnswer}
                  </Text>
               </View>
             ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Text style={{fontSize:24}}>‹</Text></TouchableOpacity>
        <Text style={styles.lvlText}>Prüfung</Text>
        <View style={styles.pill}><Text style={styles.pillText}>{currentIndex + 1} / {questions.length}</Text></View>
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
              onPress={() => setSelectedOption(opt.key)}
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

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
           <Text style={styles.nextBtnText}>{currentIndex === questions.length - 1 ? "Prüfung abgeben" : "Nächste Frage"}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 50 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, marginBottom: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e7eaf0' },
  lvlText: { fontSize: 16, fontWeight: '700', color: '#1b2432' },
  pill: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e7eaf0' },
  pillText: { fontWeight: '700', fontSize: 13, color: '#64748b' },
  questionText: { fontSize: 18, fontWeight: '600', color: '#1b2432', textAlign: 'center', marginBottom: 20 },
  mediaContainer: { alignItems: 'center', marginBottom: 24, minHeight: 150, justifyContent:'center' },
  mainImage: { width: 300, height: 200, resizeMode: 'contain', borderRadius: 12 },
  renderBox: { width: 320, height: 200, backgroundColor:'#fff', borderRadius:12, alignItems:'center', justifyContent:'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 30 },
  optionBtn: { width: '46%', height: 120, padding: 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e7eaf0', alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: {width:0,height:2}, shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  optionBtnSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', borderWidth: 2 },
  optionText: { fontSize: 17, fontWeight: '700', color: '#334155', textAlign:'center' },
  nextBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: "#2563eb", shadowOffset: {width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:4 },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  synthesisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e7eaf0' },
  synBox: { width: '30%', height: 100, justifyContent: 'center', alignItems: 'center' },
  synArrow: { width: '30%', alignItems: 'center' },
  arrowContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  arrowLine: { flex: 1, height: 2, backgroundColor: '#334155' },
  arrowHead: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#334155', marginLeft: -1 },
  synProduct: { backgroundColor: '#f8fafc', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', overflow:'hidden' },
  gradeBox: { padding: 30, backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e7eaf0' },
  gradeLabel: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  gradeHuge: { fontSize: 64, fontWeight: '900', lineHeight: 70 },
  gradeSub: { color: '#64748b', fontSize: 14 },
  controlsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  btnGhostText: { color: '#64748b', fontWeight: '600' },
  reviewHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  reviewList: { gap: 10 },
  reviewItem: { padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e7eaf0', borderLeftWidth: 5 },
  reviewOk: { borderLeftColor: '#10b981' },
  reviewBad: { borderLeftColor: '#ef4444' },
  reviewQ: { fontWeight: '700', marginBottom: 4, color: '#334155' },
  reviewAns: { color: '#64748b', fontSize: 14 },
});
