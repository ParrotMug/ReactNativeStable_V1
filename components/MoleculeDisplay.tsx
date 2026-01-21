import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface MoleculeProps {
  smiles?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
}

export default function MoleculeDisplay({ smiles, imageUrl, width = 300, height = 200 }: MoleculeProps) {

  if (imageUrl) {
    return (
      <Image 
        source={{ uri: imageUrl }} 
        style={{ width, height, resizeMode: 'contain' }} 
      />
    );
  }

  if (smiles) {
    // TRICK: Wir nutzen die PubChem API um SMILES -> PNG zu machen
    // URL-Encoding ist wichtig für Sonderzeichen im SMILES String
    const encodedSmiles = encodeURIComponent(smiles);
    const uri = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodedSmiles}/PNG?record_type=2d&image_size=${width}x${height}`;

    return (
      <View style={[styles.wrapper, { width, height }]}>
        <Image 
          source={{ uri }} 
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Weißer Hintergrund für Chemie-Strukturen
    borderRadius: 12,
  }
});
