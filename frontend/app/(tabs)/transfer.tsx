import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

export default function Transfer() {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = () => {
    if (!receiver || !amount) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    
    // In a real app, this posts to FastAPI
    // fetch('http://localhost:8000/api/transfer', { ... })

    Alert.alert("Transfer Initiated", `Sending ${amount} Yellow Coins to ${receiver}`);
    setReceiver('');
    setAmount('');
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-10">
      <Text className="text-3xl font-bold text-gray-900 mb-6">Send Value</Text>
      
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-gray-500 font-medium mb-2">Recipient ID</Text>
        <TextInput 
          className="bg-gray-50 p-4 rounded-xl text-lg mb-4 border border-gray-200"
          placeholder="e.g. C001"
          value={receiver}
          onChangeText={setReceiver}
        />

        <Text className="text-gray-500 font-medium mb-2">Amount (Yellow Coins)</Text>
        <TextInput 
          className="bg-gray-50 p-4 rounded-xl text-lg mb-8 border border-gray-200"
          placeholder="0.0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity 
          className="bg-black py-4 rounded-xl items-center"
          onPress={handleTransfer}
        >
          <Text className="text-white font-semibold text-lg">Confirm Transfer</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-xs text-gray-400 mt-4">
          Note: Transferred Yellow Coins automatically convert to Green Coins on the receiver side, representing available System Energy.
        </Text>
      </View>
    </View>
  );
}
