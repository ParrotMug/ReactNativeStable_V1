import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Engine } from './ChemieEngine';

interface Props {
  smiles: string;
  width?: number;
  height?: number;
  // NEU: Wir können das fertige SVG direkt übergeben bekommen
  cachedSvg?: string; 
}

export default function RDKitRenderer({ smiles, width = 100, height = 100, cachedSvg }: Props) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const wrapSvg = (svgContent: string) => `
      <html>
        <head>
          <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
          <style>
            body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:transparent; display:flex; justify-content:center; align-items:center; }
            svg { width:100% !important; height:100% !important; }
          </style>
        </head>
        <body>${svgContent}</body>
      </html>
    `;

    // FALL A: Wir haben das Bild schon aus dem Cache (SUPER SCHNELL)
    if (cachedSvg) {
      setSvgHtml(wrapSvg(cachedSvg));
      return;
    }

    // FALL B: Notfall-Plan (falls Cache noch nicht fertig war), wir laden es live nach
    Engine.render(smiles).then((svg) => {
      if (active && svg) {
        setSvgHtml(wrapSvg(svg));
      }
    });

    return () => { active = false; };
  }, [smiles, cachedSvg]); // Wichtig: Reagieren, wenn cachedSvg reinkommt

  if (!svgHtml) {
    // Leerer Platzhalter, solange nichts da ist
    return <View style={{ width, height }} />;
  }

  return (
    <View style={{ width, height }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: svgHtml }}
        style={{ backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        opaque={false} 
        underlayColor={'transparent'}
        androidLayerType="software"
      />
    </View>
  );
}
