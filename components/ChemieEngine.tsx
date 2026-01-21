import React, { useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Globales System für Anfragen
export const Engine = {
  queue: new Map(),
  idCounter: 0,
  webview: null as any,
  pending: [] as any[],
  
  render: (smiles: string): Promise<string> => {
    return new Promise((resolve) => {
      const id = ++Engine.idCounter;
      Engine.queue.set(id, resolve);
      
      // WICHTIG: encodeURIComponent verhindert Probleme mit Sonderzeichen im SMILES
      const payload = JSON.stringify({ id, smiles });
      // Wir nutzen eine sichere Methode, Daten zu übergeben
      const js = `window.handleRenderRequest(${payload}); true;`;
      
      if (Engine.webview) {
        Engine.webview.injectJavaScript(js);
      } else {
        Engine.pending.push(js);
      }
    });
  }
};

export function ChemieEngine() {
  const webviewRef = useRef<WebView>(null);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"></script>
    </head>
    <body>
      <div id="temp-container" style="display:none;"></div>

      <script>
        let RDKit = null;
        const tempContainer = document.getElementById('temp-container');
        
        initRDKitModule({
            locateFile: file => 'https://unpkg.com/@rdkit/rdkit/dist/' + file
        }).then(instance => {
            RDKit = instance;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
        });

        // Diese Funktion wird von draußen aufgerufen
        window.handleRenderRequest = function(data) {
            if (!RDKit || !data.smiles) return;
            
            try {
                let mol = RDKit.get_mol(data.smiles);
                if (!mol && data.smiles.includes('.')) {
                    mol = RDKit.get_mol(data.smiles, JSON.stringify({ sanitize: false }));
                }
                
                if (mol) {
                    // 1. RDKit zeichnen lassen
                    let svgString = mol.get_svg_with_highlights(JSON.stringify({
                        // Die Basisgröße ist egal, da wir sie gleich entfernen
                        width: 300, height: 300, 
                        addStereoAnnotation: false, 
                        clearBackground: true, 
                        bondLineWidth: 3.5, 
                        // FIX 1: Padding drastisch reduzieren für maximalen Platz
                        padding: 0.01 
                    }));
                    mol.delete();

                    // --- FIX 2: Harte Dimensionen entfernen für Responsivität ---
                    // Wir entfernen width="..." und height="..." aus dem SVG-Tag per Regex.
                    // Dadurch kann das CSS im RDKitRenderer (width:100%, height:100%) 
                    // das SVG auf die volle Größe des Containers ziehen.
                    svgString = svgString.replace(/width=['"][0-9px\.]+['"]/i, "");
                    svgString = svgString.replace(/height=['"][0-9px\.]+['"]/i, "");


                    // --- FIX 3: Der Transparenz-Hack (Sticker entfernen) ---
                    tempContainer.innerHTML = svgString;
                    const svgElem = tempContainer.querySelector('svg');

                    if (svgElem) {
                        // Sicherstellen, dass das SVG sich auch im Container ausdehnt
                        svgElem.style.width = "100%";
                        svgElem.style.height = "100%";
                        // preserveAspectRatio sorgt dafür, dass es nicht verzerrt wird, 
                        // aber den Platz maximal ausnutzt (xMidYMid meet ist Standard, aber sicher ist sicher)
                        if (!svgElem.hasAttribute('preserveAspectRatio')) {
                             svgElem.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                        }

                        const bgRect = svgElem.querySelector('rect');
                        if (bgRect) {
                            bgRect.style.fill = 'none';
                            bgRect.style.fillOpacity = '0';
                        }
                        
                        // Das finale, saubere SVG holen
                        const cleanedSvg = tempContainer.innerHTML;
                        window.ReactNativeWebView.postMessage(JSON.stringify({ id: data.id, svg: cleanedSvg }));
                    } else {
                        // Fallback
                        window.ReactNativeWebView.postMessage(JSON.stringify({ id: data.id, svg: svgString }));
                    }
                    tempContainer.innerHTML = "";

                } else {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ id: data.id, error: true }));
                }
            } catch(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ id: data.id, error: true }));
            }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 0, width: 0, overflow: 'hidden', position: 'absolute' }}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'READY') {
              Engine.webview = webviewRef.current;
              Engine.pending.forEach(js => Engine.webview.injectJavaScript(js));
              Engine.pending = [];
            } else if (msg.id) {
              const resolve = Engine.queue.get(msg.id);
              if (resolve) {
                resolve(msg.svg || null);
                Engine.queue.delete(msg.id);
              }
            }
          } catch(e) {}
        }}
      />
    </View>
  );
}
