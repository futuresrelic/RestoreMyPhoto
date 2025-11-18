import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function TestScreen() {
  const [result, setResult] = useState('Not tested yet');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      const response = await fetch('https://restoremyphoto-backend.onrender.com/health');
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      Alert.alert('SUCCESS!', 'Backend is working! ✅');
    } catch (error) {
      setResult(`ERROR: ${error.message}`);
      Alert.alert('Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Test</Text>
      <Text style={styles.url}>https://restoremyphoto-backend.onrender.com</Text>

      <Button
        title={loading ? "Testing..." : "Test Backend Connection"}
        onPress={testBackend}
        disabled={loading}
      />

      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{result}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  url: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    minHeight: 100,
  },
  resultText: {
    color: '#fff',
    fontFamily: 'monospace',
  },
});
