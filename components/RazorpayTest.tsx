import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { isRazorpayAvailable, initializeRazorpayPayment } from '../services/razorpayService';

const RazorpayTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testRazorpay = async () => {
    setIsLoading(true);
    
    try {
      console.log('Testing Razorpay availability...');
      const available = isRazorpayAvailable();
      console.log('Razorpay available:', available);
      
      if (!available) {
        Alert.alert('Razorpay Test', 'Razorpay SDK is not available. Using mock payment.');
        return;
      }

      // Test payment options
      const testOptions = {
        key: 'rzp_test_RAot6pShbTEmTM', // Your test key
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        order_id: 'test_order_' + Date.now(),
        name: 'Test Store',
        description: 'Test payment',
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        notes: {
          test: 'true',
        },
        theme: {
          color: '#eb2424',
        },
      };

      console.log('Initializing test payment...');
      const result = await initializeRazorpayPayment(testOptions);
      console.log('Test payment result:', result);
      
      Alert.alert('Success', 'Razorpay integration is working!');
      
    } catch (error: any) {
      console.error('Test payment error:', error);
      Alert.alert('Error', error.message || 'Test payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Razorpay Integration Test</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={testRazorpay}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Razorpay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#eb2424',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RazorpayTest;
