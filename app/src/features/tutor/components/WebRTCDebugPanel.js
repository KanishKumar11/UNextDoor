/**
 * WebRTC Debug Panel
 * A debug component to help diagnose WebRTC session issues
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useWebRTCConversation } from '../hooks/useWebRTCConversation';
import { quickInputCheck, runWebRTCDiagnostics, testUserInputDetection } from '../utils/webrtcDiagnostics';

export const WebRTCDebugPanel = ({ visible = false }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [quickCheck, setQuickCheck] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [logs, setLogs] = useState([]);

  const {
    isSessionActive,
    isConnected,
    isAISpeaking,
    isCleaningUp,
    canStartNewSession,
    startSession,
    stopSession,
  } = useWebRTCConversation();

  // Auto-refresh diagnostics
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setQuickCheck(quickInputCheck());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `${timestamp}: ${message}`]);
  };

  const runFullDiagnostics = () => {
    addLog('Running full diagnostics...');
    const results = runWebRTCDiagnostics();
    setDiagnostics(results);
    addLog(`Diagnostics complete - ${results.potentialIssues.length} issues found`);
  };

  const runInputTest = async () => {
    addLog('Starting user input test...');
    try {
      const results = await testUserInputDetection();
      setTestResults(results);
      addLog(`Input test complete - ${results.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      addLog(`Input test error: ${error.message}`);
    }
  };

  const handleStartSession = async () => {
    addLog('Starting test session...');
    try {
      const success = await startSession('debug-test', 'beginner');
      addLog(`Session start: ${success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      addLog(`Session start error: ${error.message}`);
    }
  };

  const handleStopSession = async () => {
    addLog('Stopping session...');
    try {
      await stopSession();
      addLog('Session stopped');
    } catch (error) {
      addLog(`Session stop error: ${error.message}`);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebRTC Debug Panel</Text>
      
      {/* Quick Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Status</Text>
        <Text style={styles.statusText}>Session Active: {isSessionActive ? '✅' : '❌'}</Text>
        <Text style={styles.statusText}>Connected: {isConnected ? '✅' : '❌'}</Text>
        <Text style={styles.statusText}>AI Speaking: {isAISpeaking ? '🗣️' : '🔇'}</Text>
        <Text style={styles.statusText}>Cleaning Up: {isCleaningUp ? '🧹' : '✅'}</Text>
        <Text style={styles.statusText}>Can Start New: {canStartNewSession ? '✅' : '❌'}</Text>
      </View>

      {/* Quick Input Check */}
      {quickCheck && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Check</Text>
          <Text style={styles.statusText}>Can Detect Input: {quickCheck.canDetectInput ? '✅' : '❌'}</Text>
          {quickCheck.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>{issue}</Text>
          ))}
          {quickCheck.fixes.length > 0 && (
            <View>
              <Text style={styles.fixTitle}>Suggested Fixes:</Text>
              {quickCheck.fixes.map((fix, index) => (
                <Text key={index} style={styles.fixText}>• {fix}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleStartSession}>
            <Text style={styles.buttonText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleStopSession}>
            <Text style={styles.buttonText}>Stop Session</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={runFullDiagnostics}>
            <Text style={styles.buttonText}>Full Diagnostics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={runInputTest}>
            <Text style={styles.buttonText}>Test Input</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logs</Text>
        <ScrollView style={styles.logContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>

      {/* Diagnostics Results */}
      {diagnostics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostics Results</Text>
          <Text style={styles.statusText}>Issues: {diagnostics.potentialIssues.length}</Text>
          {diagnostics.potentialIssues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>❌ {issue}</Text>
          ))}
          {diagnostics.recommendations.map((rec, index) => (
            <Text key={index} style={styles.fixText}>💡 {rec}</Text>
          ))}
        </View>
      )}

      {/* Test Results */}
      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Test Results</Text>
          <Text style={styles.statusText}>Success: {testResults.success ? '✅' : '❌'}</Text>
          <Text style={styles.statusText}>Steps: {testResults.steps.length}</Text>
          <Text style={styles.statusText}>Issues: {testResults.issues.length}</Text>
          {testResults.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>❌ {issue}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  issueText: {
    color: '#FF5722',
    fontSize: 11,
    marginBottom: 1,
  },
  fixTitle: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  fixText: {
    color: '#FFC107',
    fontSize: 11,
    marginBottom: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  logContainer: {
    maxHeight: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 3,
  },
  logText: {
    color: '#E0E0E0',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default WebRTCDebugPanel;
