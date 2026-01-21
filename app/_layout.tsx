import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ChemieEngine } from '../components/ChemieEngine';
import { AuthProvider } from '../contexts/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <ChemieEngine />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </AuthProvider>
  );
}
