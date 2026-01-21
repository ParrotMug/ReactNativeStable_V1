import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PracticeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>🧪 Übungsmodus</Text>
      <Text style={styles.text}>Hier kommt gleich dein Quiz-Code hin.</Text>

      {/* Zurück Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
        <Text style={styles.btnText}>Zurück zum Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#666',
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  btnText: {
    fontWeight: '600',
    color: '#333',
  }
});
