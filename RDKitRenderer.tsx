// components/RDKitRenderer.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  smiles: string;
  width?: number;
  height?: number;
}

export default function RDKitRenderer({ smiles, width = 300, height = 200 }: Props) {
  if (!smiles) return null;

  // Das ist die Mini-Webseite, die wir intern laden.
  // Sie lädt RDKit genau wie deine alte App.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: transparent; }
        #mol-container { width: 100%; height: 100%; }
        svg { width: 100% !important; height: 100% !important; }
      </style>
      <script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"></script>
    </head>
    <body>
      <div id="mol-container"></div>
      <script>
        let rdkitPromise = initRDKitModule();

        async function renderSmiles(smiles) {
          const RDKit = await rdkitPromise;
          const container = document.getElementById('mol-container');

          // Mol erstellen
          let mol = RDKit.get_mol(smiles);
          // Fallback für Molekül-Mischungen (mit Punkt)
          if (!mol && smiles.includes('.')) {
             mol = RDKit.get_mol(smiles, JSON.stringify({ sanitize: false }));
          }

          if (mol) {
            const svg = mol.get_svg_with_highlights(JSON.stringify({
               width: window.innerWidth, 
               height: window.innerHeight,
               addStereoAnnotation: false, 
               clearBackground: true, 
               bondLineWidth: 1.5, // Deine alten Einstellungen
               padding: 0.05
            }));
            container.innerHTML = svg;
            mol.delete();
          } else {
            container.innerHTML = '<div style="color:red;font-family:sans-serif;">Strukturfehler</div>';
          }
        }

        // Starten
        renderSmiles("${smiles.replace(/"/g, '\\"')}");
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width, height, overflow: 'hidden', borderRadius: 12 }}>
       <WebView
         originWhitelist={['*']}
         source={{ html: htmlContent }}
         style={{ backgroundColor: 'transparent', width, height }}
         scrollEnabled={false}
         showsVerticalScrollIndicator={false}
         showsHorizontalScrollIndicator={false}
         // Zeige einen Ladekreisel, solange das WebView lädt
         startInLoadingState={true}
         renderLoading={() => (
            <View style={styles.loading}>
               <ActivityIndicator color="#2a7fff" />
            </View>
         )}
       />
    </View>
  );
}

const styles = StyleSheet.create({
   loading: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: '#f6f7fb' 
   }
});
