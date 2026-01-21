import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ChemieEngine } from '../components/ChemieEngine';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Die unsichtbare Chemie-Maschine läuft hier im Hintergrund */}
      <ChemieEngine />
      
      {/* Deine eigentliche App */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
