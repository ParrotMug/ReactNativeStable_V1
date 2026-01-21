import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TOPIC_DATA } from '../assets/data/index';
import RDKitRenderer from '../components/RDKitRenderer';
import { useMoleculePreloader } from '../hooks/useMoleculePreloader';

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function SandboxScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicKey = (params.topic as string) || 'universal';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // --- PRELOADER (Für Speed) ---
  const { cache, isReady, progress } = useMoleculePreloader(questions, 10);

  // 1. Daten laden
  useEffect(() => {
    const rawData = TOPIC_DATA[topicKey];
    if (rawData && Array.isArray(rawData)) {
      setQuestions(shuffle(rawData));
      setDataLoaded(true);
    } else {
      console.warn("Keine Daten gefunden für:", topicKey);
    }
  }, [topicKey]);

  // State für Quiz
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

  const currentQ = questions[currentIndex];

  // 2. Optionen vorbereiten (HIER WAR DER FEHLER)
  useEffect(() => {
    if (!currentQ) return;

    let opts: any[] = [];

    // Fall A: Optionen sind ein Array (z.B. ["Antwort 1", "Antwort 2"])
    if (Array.isArray(currentQ.options)) {
      opts = currentQ.options.map((o: any, i: number) => ({ 
        key: o.key || ['A', 'B', 'C', 'D'][i], 
        text: o.text || o 
      }));
    } 
    // Fall B: Optionen sind ein Objekt (z.B. {"A": "...", "B": "..."}) <--- DAS FEHLTE!
    else if (typeof currentQ.options === 'object' && currentQ.options !== null) {
      opts = Object.entries(currentQ.options).map(([k, v]) => ({ 
        key: k, 
        text: String(v) 
      }));
    }

    // R/S Check (Sortierung)
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
  }, [currentIndex, currentQ]);


  // --- LOGIK ---
  const handleAnswer = (key: string) => {
    if (selectedOption) return; 

    setSelectedOption(key);
    const correct = key === currentQ.correct;
    setIsCorrect(correct);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const mixed = shuffle(questions);
        setQuestions(mixed);
        setCurrentIndex(0);
      }
    }, 1500); 
  };

  const getBtnStyle = (key: string) => {
    const base = styles.optionBtn;
    if (!selectedOption) return base; 
    if (key === currentQ.correct) return [base, styles.optionBtnCorrect]; 
    if (key === selectedOption && !isCorrect) return [base, styles.optionBtnWrong]; 
    return [base, { opacity: 0.5 }];
  };

  // Ladescreen
  if (!dataLoaded || !isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2a7fff" />
        <Text style={{marginTop:20, fontWeight:'600', fontSize:16, color:'#334155'}}>
          Bereite Labor vor...
        </Text>
        <View style={{marginTop:10, width:200, height:6, backgroundColor:'#e2e8f0', borderRadius:3}}>
           <View style={{width: `${progress * 100}%`, height:'100%', backgroundColor:'#2a7fff', borderRadius:3}} />
        </View>
      </View>
    );
  }

  if (!currentQ) {
    return (
      <View style={styles.center}>
        <Text>Keine Fragen gefunden.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{color:'blue'}}>Zurück</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Text style={{fontSize:24, lineHeight:24}}>‹</Text>
        </TouchableOpacity>
        <View style={styles.xpBarContainer}>
           <Text style={styles.lvlText}>Sandbox Mode</Text>
        </View>
        <View style={{width:40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.questionText}>{currentQ.question}</Text>

        {/* Medien Bereich */}
        <View style={styles.mediaContainer}>
           {currentQ.arrow_label ? (
             <View style={styles.synthesisRow}>
                <View style={styles.synBox}>
                   <RDKitRenderer smiles={currentQ.smiles} cachedSvg={cache.get(currentQ.smiles)} width={90} height={90} />
                </View>
                <View style={styles.synArrow}>
                   <Text style={{fontSize:10, textAlign:'center', marginBottom:2}}>{currentQ.arrow_label}</Text>
                   <View style={styles.arrowContainer}>
                      <View style={styles.arrowLine} /><View style={styles.arrowHead} />
                   </View>
                </View>
                <View style={[styles.synBox, styles.synProduct, currentQ.product && { borderStyle:'solid', borderWidth:0 }]}>
                   {currentQ.product ? (
                      <RDKitRenderer smiles={currentQ.product} cachedSvg={cache.get(currentQ.product)} width={90} height={90} />
                   ) : (
                      <Text style={{fontSize:30, color:'#cbd5e1', fontWeight:'bold'}}>?</Text>
                   )}
                </View>
             </View>
           ) : (
             currentQ.image ? (
                <Image 
                  source={{ uri: currentQ.image }} 
                  style={{ width: 300, height: 200, resizeMode: 'contain', borderRadius: 12 }} 
                />
             ) : (
                <View style={{ width: 320, height: 200, backgroundColor:'#fff', borderRadius:12, alignItems:'center', justifyContent:'center' }}>
                    <RDKitRenderer smiles={currentQ.smiles} cachedSvg={cache.get(currentQ.smiles)} width={300} height={180} />
                </View>
             )
           )}
        </View>

        {/* Optionen Grid */}
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
              ) : (
                 <Text style={styles.optionText}>{opt.text}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedOption && currentQ.explanation && (
          <View style={styles.explanationBox}>
            <Text style={{fontWeight:'bold', marginBottom:4}}>Erklärung:</Text>
            <Text style={{color:'#334155'}}>{currentQ.explanation}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 50 },

  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, marginBottom: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e7eaf0' },
  xpBarContainer: { alignItems: 'center' },
  lvlText: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },

  questionText: { fontSize: 18, fontWeight: '600', color: '#1b2432', textAlign: 'center', marginBottom: 20 },
  mediaContainer: { alignItems: 'center', marginBottom: 24, minHeight: 150, justifyContent:'center' },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  
  optionBtn: { 
    width: '46%', height: 120, padding: 4, backgroundColor: '#fff', borderRadius: 16, 
    borderWidth: 1, borderColor: '#e7eaf0', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: {width:0,height:2}, shadowOpacity:0.05, shadowRadius:4, elevation:2
  },
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
  explanationBox: { marginTop: 20, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12 }
});
