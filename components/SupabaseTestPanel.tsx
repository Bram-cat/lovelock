import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function SupabaseTestPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Connection
      results.push({ test: 'Connection', status: 'Testing...', details: '' });
      setTestResults([...results]);
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      results[results.length - 1] = {
        test: 'Connection',
        status: connectionError ? '❌ Failed' : '✅ Success',
        details: connectionError?.message || 'Connected to Supabase'
      };

      // Test 2: Table exists
      results.push({ test: 'Table Structure', status: 'Testing...', details: '' });
      setTestResults([...results]);
      
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(0);
        
      results[results.length - 1] = {
        test: 'Table Structure',
        status: tableError ? '❌ Failed' : '✅ Success',
        details: tableError?.message || 'Table exists and accessible'
      };

      // Test 3: Insert test record
      results.push({ test: 'Insert Test', status: 'Testing...', details: '' });
      setTestResults([...results]);
      
      const testUserId = `test_${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: testUserId,
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      results[results.length - 1] = {
        test: 'Insert Test',
        status: insertError ? '❌ Failed' : '✅ Success',
        details: insertError?.message || `Inserted test record: ${testUserId}`
      };

      // Test 4: Read test record
      if (!insertError) {
        results.push({ test: 'Read Test', status: 'Testing...', details: '' });
        setTestResults([...results]);
        
        const { data: readData, error: readError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)
          .single();

        results[results.length - 1] = {
          test: 'Read Test',
          status: readError ? '❌ Failed' : '✅ Success',
          details: readError?.message || `Read record: ${readData?.email}`
        };

        // Clean up - delete test record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId);
      }

      // Test 5: List all profiles
      results.push({ test: 'List Profiles', status: 'Testing...', details: '' });
      setTestResults([...results]);
      
      const { data: allProfiles, error: listError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      results[results.length - 1] = {
        test: 'List Profiles',
        status: listError ? '❌ Failed' : '✅ Success',
        details: listError?.message || `Found ${allProfiles?.length || 0} profiles in database`
      };

      if (allProfiles && allProfiles.length > 0) {
        results.push({
          test: 'Recent Profiles',
          status: '📋 Info',
          details: allProfiles.map(p => `${p.email} (${p.id.substring(0, 8)}...)`).join('\n')
        });
      }

    } catch (error: any) {
      results.push({
        test: 'Unexpected Error',
        status: '❌ Failed',
        details: error?.message || 'Unknown error occurred'
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  if (!showPanel) {
    return (
      <TouchableOpacity 
        style={styles.testToggle}
        onPress={() => setShowPanel(true)}
      >
        <Ionicons name="server" size={20} color="#0066CC" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.testPanel}>
      <View style={styles.testHeader}>
        <Text style={styles.testTitle}>🗄️ Supabase Test Panel</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.runButton}
            onPress={runTests}
            disabled={loading}
          >
            <Text style={styles.runButtonText}>
              {loading ? 'Running...' : 'Run Tests'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowPanel(false)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.testContent}>
        {testResults.length === 0 ? (
          <Text style={styles.noTestsText}>Click "Run Tests" to check Supabase integration</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.testResult}>
              <Text style={styles.testName}>{result.test}</Text>
              <Text style={styles.testStatus}>{result.status}</Text>
              {result.details ? (
                <Text style={styles.testDetails}>{result.details}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  testToggle: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0,102,204,0.1)',
    borderRadius: 20,
    padding: 10,
    zIndex: 1000,
  },
  testPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    paddingTop: 50,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  testTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  runButton: {
    backgroundColor: '#0066CC',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  runButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 5,
  },
  testContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noTestsText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  testResult: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  testName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testStatus: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 5,
  },
  testDetails: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 16,
  },
});