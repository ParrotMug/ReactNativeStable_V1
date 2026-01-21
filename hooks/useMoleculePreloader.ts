import { useState, useEffect } from 'react';
import { Engine } from '../components/ChemieEngine';

export function useMoleculePreloader(questions: any[], batchSize = 5) {
  const [cache, setCache] = useState<Map<string, string>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    let isMounted = true;
    const uniqueSmiles = new Set<string>();

    // 1. Alle SMILES sammeln (Fragebilder UND Antwortbilder)
    questions.forEach(q => {
      if (q.smiles) uniqueSmiles.add(q.smiles);
      if (q.product) uniqueSmiles.add(q.product);
      // Wenn Optionen visuell sind (Moleküle), auch diese sammeln
      if (q.visual_options && q.options) {
        if (Array.isArray(q.options)) {
          q.options.forEach((o: any) => {
             const txt = typeof o === 'string' ? o : o.text;
             if (txt) uniqueSmiles.add(txt);
          });
        } else {
           Object.values(q.options).forEach((v: any) => uniqueSmiles.add(String(v)));
        }
      }
    });

    const smilesList = Array.from(uniqueSmiles);
    const totalToLoad = Math.min(smilesList.length, batchSize); // Erstmal nur den Batch laden für Start
    let loadedCount = 0;

    // 2. Funktion zum Laden eines einzelnen SMILES
    const loadItem = async (smiles: string) => {
      if (cache.has(smiles)) return; // Schon da

      const svg = await Engine.render(smiles);
      if (isMounted && svg) {
        setCache(prev => {
          const newMap = new Map(prev);
          newMap.set(smiles, svg);
          return newMap;
        });
      }
    };

    // 3. Initiale Batch-Ladung (Blockierend für Start)
    const startPreload = async () => {
      const initialBatch = smilesList.slice(0, batchSize); 
      
      // Parallel abfeuern für Speed
      await Promise.all(initialBatch.map(async (s) => {
        await loadItem(s);
        loadedCount++;
        if(isMounted) setProgress(loadedCount / totalToLoad);
      }));

      if(isMounted) setIsReady(true);

      // 4. Den Rest im Hintergrund laden (Non-blocking)
      const remaining = smilesList.slice(batchSize);
      for (const s of remaining) {
        if (!isMounted) break;
        await loadItem(s);
        // Kleines Päuschen, um die UI nicht einzufrieren
        await new Promise(r => setTimeout(r, 50)); 
      }
    };

    startPreload();

    return () => { isMounted = false; };
  }, [questions]);

  return { cache, isReady, progress };
}
